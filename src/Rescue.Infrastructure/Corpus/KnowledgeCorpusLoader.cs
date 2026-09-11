using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using Rescue.Domain.Entities;

namespace Rescue.Infrastructure.Corpus;

public record IndexedDocument(
    string Id,
    string Title,
    string Type,
    string Service,
    string FilePath,
    string Content,
    List<string> Tags
);

public class KnowledgeCorpusLoader
{
    public static List<IndexedDocument> LoadDocuments(string corpusRoot)
    {
        var result = new List<IndexedDocument>();
        if (!Directory.Exists(corpusRoot))
        {
            return result;
        }

        var files = Directory.GetFiles(corpusRoot, "*.*", SearchOption.AllDirectories);
        foreach (var file in files)
        {
            var ext = Path.GetExtension(file).ToLowerInvariant();
            if (ext != ".md" && ext != ".json" && ext != ".yaml" && ext != ".cs")
                continue;

            try
            {
                var content = File.ReadAllText(file);
                var id = Path.GetFileNameWithoutExtension(file);
                var title = Path.GetFileName(file);
                var type = Path.GetDirectoryName(file)?.Split(Path.DirectorySeparatorChar)[^1] ?? "general";
                var service = "AcmeCommerce";
                var tags = new List<string> { type };

                // Parse markdown frontmatter if present
                if (content.StartsWith("---"))
                {
                    var match = Regex.Match(content, @"^---\s*
(.*?)
---\s*
(.*)$", RegexOptions.Singleline);
                    if (match.Success)
                    {
                        var frontmatter = match.Groups[1].Value;
                        var idMatch = Regex.Match(frontmatter, @"id:\s*(.+)");
                        if (idMatch.Success) id = idMatch.Groups[1].Value.Trim();

                        var typeMatch = Regex.Match(frontmatter, @"type:\s*(.+)");
                        if (typeMatch.Success) type = typeMatch.Groups[1].Value.Trim();

                        var svcMatch = Regex.Match(frontmatter, @"service:\s*(.+)");
                        if (svcMatch.Success) service = svcMatch.Groups[1].Value.Trim();
                    }
                }

                result.Add(new IndexedDocument(
                    id,
                    title,
                    type,
                    service,
                    file,
                    content,
                    tags
                ));
            }
            catch
            {
                // Continue indexing remaining documents
            }
        }

        return result;
    }
}
