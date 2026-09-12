import os
import sys
import json
import time
import glob
from http.server import HTTPServer, BaseHTTPRequestHandler

# Add bundled native core to python path
current_dir = os.path.dirname(os.path.abspath(__file__))
core_dir = os.path.join(current_dir, "core")
if os.path.isdir(core_dir) and core_dir not in sys.path:
    sys.path.insert(0, core_dir)

try:
    import moss_core
except ImportError as err:
    print(f"FATAL: Failed to import moss_core from {core_dir}: {err}", flush=True)
    sys.exit(1)

project_id = os.environ.get("MOSS_PROJECT_ID", "").strip()
project_key = os.environ.get("MOSS_PROJECT_KEY", "").strip()
index_name = os.environ.get("MOSS_INDEX_NAME", "rescue-knowledge").strip()
port = int(os.environ.get("MOSS_BRIDGE_PORT", "5188"))

if not project_id or not project_key:
    print("FATAL: MOSS_PROJECT_ID and MOSS_PROJECT_KEY environment variables are required.", flush=True)
    sys.exit(1)

print(f"Initializing Moss Cloud integration for Project ID: {project_id}...", flush=True)

# Authenticate with Moss Cloud
try:
    manage_client = moss_core.ManageClient(project_id, project_key)
    cred_info = manage_client.validate_credentials()
    print("Moss Cloud: Credentials validated successfully.", flush=True)
except Exception as e:
    print(f"FATAL: Failed to validate Moss Cloud credentials: {type(e).__name__}: {e}", flush=True)
    sys.exit(1)

# Ensure knowledge index exists in Moss Cloud
index_manager = moss_core.IndexManager(project_id, project_key)
index_info = None

try:
    print(f"Moss Cloud: Loading index '{index_name}'...", flush=True)
    index_info = index_manager.load_index(index_name)
    print(f"Moss Cloud: Index '{index_name}' loaded successfully ({index_info.doc_count} documents).", flush=True)
except Exception as e:
    print(f"Index '{index_name}' not ready or missing ({e}). Checking cloud index list...", flush=True)
    try:
        remote_indexes = manage_client.list_indexes()
        found = any(idx.name == index_name for idx in remote_indexes)
        if not found:
            print(f"Index '{index_name}' not found in Moss Cloud. Ingesting knowledge corpus...", flush=True)
            knowledge_path = os.path.abspath(os.path.join(current_dir, "..", "..", "..", "knowledge"))
            docs = []
            for p in glob.glob(os.path.join(knowledge_path, "**", "*.*"), recursive=True):
                if os.path.isfile(p):
                    with open(p, "r", encoding="utf-8", errors="ignore") as f:
                        text = f.read()
                    rel = os.path.relpath(p, knowledge_path).replace("\\", "/").replace(".", "_")
                    docs.append(moss_core.DocumentInfo(id=rel, text=text[:1000], metadata={"path": rel}))
            
            if docs:
                manage_client.create_index(index_name, docs, "moss-minilm")
                print(f"Moss Cloud: Successfully created index '{index_name}' with {len(docs)} documents.", flush=True)
                index_info = index_manager.load_index(index_name)
    except Exception as create_err:
        print(f"Warning during index sync: {create_err}", flush=True)

class MossBridgeHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Suppress noisy standard request logs
        pass

    def do_GET(self):
        if self.path in ("/health", "/api/health"):
            doc_count = getattr(index_info, "doc_count", 0) if index_info else 0
            payload = {
                "status": "ok",
                "provider": "MossCloud",
                "indexName": index_name,
                "docCount": doc_count,
                "projectId": project_id
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(payload).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path in ("/query", "/api/query"):
            try:
                length = int(self.headers.get("Content-Length", 0))
                raw_body = self.rfile.read(length).decode("utf-8")
                data = json.loads(raw_body) if raw_body else {}
                query_str = data.get("query", "").strip()
                top_k = int(data.get("topK", 5))

                if not query_str:
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Query string is required"}).encode("utf-8"))
                    return

                t0 = time.perf_counter()
                search_res = index_manager.query_text(index_name, query_str, top_k)
                t1 = time.perf_counter()
                latency_ms = round((t1 - t0) * 1000.0, 2)

                hits = []
                for doc in getattr(search_res, "docs", []):
                    hits.append({
                        "docId": doc.id,
                        "score": round(float(doc.score), 4),
                        "snippet": doc.text[:280] if getattr(doc, "text", None) else ""
                    })

                resp_payload = {
                    "query": query_str,
                    "latencyMs": latency_ms,
                    "provider": "MossCloud",
                    "hits": hits
                }

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(resp_payload).encode("utf-8"))

            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                # Never leak credentials in exception payload
                safe_msg = str(e).replace(project_key, "[REDACTED]")
                self.wfile.write(json.dumps({"error": f"Retrieval failed: {safe_msg}"}).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

server = HTTPServer(("127.0.0.1", port), MossBridgeHandler)
print(f"Moss Cloud Bridge listening on http://127.0.0.1:{port}...", flush=True)

try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
