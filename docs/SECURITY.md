# Security Architecture & Guardrails

Rescue is designed with strict enterprise security boundaries:

1. **Human-in-the-Loop Approval Gate:**
   - In **RECOMMEND** mode (default), Rescue will NEVER mutate code, configuration, or deployments without explicit human authorization.
   - Every proposed patch requires verified evidence, test validation, risk assessment, and human approval.

2. **No Arbitrary Shell Execution:**
   - Rescue operates through structured code patch models and vetted Git/deployment providers.
   - It never executes arbitrary AI-generated shell scripts.

3. **Secret Sanitization:**
   - The validation engine checks all generated patches for potential leaked API keys, tokens, or credentials before displaying them.

4. **Zero Production Mutation in Demo:**
   - Even in **AUTONOMOUS** mode, production mutation is disabled or restricted to staging sandboxes.

5. **Safe GitHub Integration:**
   - Demo GitHub mode generates local branch previews, commit SHAs, and markdown PRs without requiring real GitHub tokens.
