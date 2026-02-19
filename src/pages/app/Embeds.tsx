import { useState } from "react";
import { Copy, Check, Code2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const BASE_URL = "https://alkmaar-red-report.lovable.app";

interface EmbedConfig {
  id: string;
  title: string;
  description: string;
  path: string;
  defaultHeight: number;
  hasParam?: boolean;
  paramLabel?: string;
  paramPlaceholder?: string;
}

const embeds: EmbedConfig[] = [
  {
    id: "standings",
    title: "Eredivisie Stand",
    description: "Compacte standenlijst met top 5 + AZ-positie. Perfect bij competitie-artikelen.",
    path: "/embed/standings",
    defaultHeight: 350,
  },
  {
    id: "last-match",
    title: "Laatste Uitslag",
    description: "Uitslagkaart van de laatste AZ-wedstrijd met logo's en score.",
    path: "/embed/last-match",
    defaultHeight: 220,
  },
  {
    id: "next-match",
    title: "Volgende Wedstrijd",
    description: "Toont de eerstvolgende AZ-wedstrijd met tegenstander en tijdstip.",
    path: "/embed/next-match",
    defaultHeight: 220,
  },
  {
    id: "h2h",
    title: "Head-to-Head",
    description: "Visuele W-G-V verdeling tegen de volgende tegenstander.",
    path: "/embed/h2h",
    defaultHeight: 200,
  },
  {
    id: "match-stats",
    title: "Wedstrijdstatistieken",
    description: "Balbezit, schoten, xG en meer voor een specifieke wedstrijd.",
    path: "/embed/match-stats",
    defaultHeight: 450,
    hasParam: true,
    paramLabel: "Fixture ID",
    paramPlaceholder: "bijv. 1234567",
  },
];

const EmbedCard = ({ embed }: { embed: EmbedConfig }) => {
  const [copied, setCopied] = useState(false);
  const [paramValue, setParamValue] = useState("");

  const fullPath = embed.hasParam
    ? `${embed.path}/${paramValue || "{ID}"}`
    : embed.path;

  const iframeCode = `<iframe\n  src="${BASE_URL}${fullPath}"\n  width="100%"\n  height="${embed.defaultHeight}"\n  frameborder="0"\n  style="border:none;border-radius:12px;overflow:hidden;"\n></iframe>`;

  const handleCopy = () => {
    if (embed.hasParam && !paramValue) {
      toast.error("Vul eerst een Fixture ID in");
      return;
    }
    navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    toast.success("Iframe-code gekopieerd!");
    setTimeout(() => setCopied(false), 2000);
  };

  const previewUrl = embed.hasParam
    ? paramValue ? `${BASE_URL}${embed.path}/${paramValue}` : null
    : `${BASE_URL}${embed.path}`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-app-heading flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary" />
          {embed.title}
        </CardTitle>
        <CardDescription className="text-app-small">
          {embed.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {embed.hasParam && (
          <div className="flex gap-2">
            <Input
              placeholder={embed.paramPlaceholder}
              value={paramValue}
              onChange={(e) => setParamValue(e.target.value)}
              className="font-mono text-app-small"
            />
          </div>
        )}

        <div className="relative">
          <pre className="bg-muted rounded-lg p-3 text-app-tiny font-mono overflow-x-auto whitespace-pre-wrap break-all text-muted-foreground">
            {iframeCode}
          </pre>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleCopy} size="sm" className="gap-1.5">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Gekopieerd" : "Kopieer code"}
          </Button>
          {previewUrl && (
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Preview
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Embeds = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-app-title font-headline">Embed Widgets</h1>
        <p className="text-app-body text-muted-foreground mt-1">
          Kopieer de iframe-code en plak deze in een WordPress-artikel op azfanpage.nl.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {embeds.map((embed) => (
          <EmbedCard key={embed.id} embed={embed} />
        ))}
      </div>
    </div>
  );
};

export default Embeds;
