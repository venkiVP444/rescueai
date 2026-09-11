using System.Collections.Generic;

namespace Rescue.Domain.Entities;

public class EvidenceGraph
{
    public List<EvidenceNode> Nodes { get; set; } = new();
    public List<EvidenceEdge> Edges { get; set; } = new();
}

public class EvidenceNode
{
    public string Id { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string NodeType { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public string Snippet { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
}

public class EvidenceEdge
{
    public string SourceId { get; set; } = string.Empty;
    public string TargetId { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
}
