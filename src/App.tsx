import { Button } from "./components/ui/button";
import { Separator } from "./components/ui/separator";
import { Github, Wand2 } from "lucide-react";
import { Textarea } from "./components/ui/textarea";
import { Label } from "./components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Slider } from "@/components/ui/slider";
import { VideoInputForm } from "./components/ui/video-input-form";
import { PromptSelect } from "./components/promptSelct";
import { useState } from "react";
import { useCompletion } from "ai/react";

export function App() {
  const [temperature, setTemperature] = useState(0.5);
  const [videoId, setVideoId] = useState<string | null>(null);

  const {
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    completion,
    isLoading,
  } = useCompletion({
    api: "http://localhost:3333/ai/complete",
    body: {
      videoId,
      temperature,
    },
    headers: {
      'Content-type': 'application/json'
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-6 py-3 flex items-center justify-between border-b">
        <h1 className="text-xl font-bold">upload.ai</h1>

        <div className="flex gap-3 items-center">
          <span className="text-sm text-muted-foreground">
            Desenvolvido com ❤ por Alisson
          </span>

          <Separator orientation="vertical" className="h-6" />
          <Button variant="outline">
            <Github className="w-4 h-4 mr-2" />
            Github
          </Button>
        </div>
      </div>

      <main className="flex-1 p-6 flex gap-6">
        <div className="flex flex-col flex-1 gap-4">
          <div className="grid grid-rows-2 gap-4 flex-1">
            <Textarea
              className="resize-none p-5 leading-relaxed"
              placeholder="Inclua um prompt para a IA..."
              value={input}
              onChange={handleInputChange}
            />
            <Textarea
              className="resize-none p-5 leading-relaxed"
              placeholder="Resulado gerado pela IA..."
              readOnly
              value={completion}
            />
          </div>

          <p className="tex-sm text-muted-foreground">
            Lembre-se: você pode utilizar a variável transcription no seu promps
            para adicionar o conteudoda{" "}
            <code className="text-green-400">{"{transcrição}"}</code> do video
            selecionado
          </p>
        </div>
        <aside className="w-80 space-y-6">
          <VideoInputForm onVideoUpload={setVideoId} />

          <Separator />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label>Prompt</Label>
              <PromptSelect onPromptSelected={setInput} />

              <span className="block text-xs text-muted-foreground italic">
                Você podera customizar essa opção em breve
              </span>
            </div>

            <div className="space-y-4">
              <Label>Modelo</Label>
              <Select disabled defaultValue="gpt3.5">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt3.5">GPT 3.5-turbo 16k</SelectItem>
                </SelectContent>
              </Select>

              <span className="block text-xs text-muted-foreground italic">
                Você podera customizar essa opção em breve
              </span>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Temperatura</Label>

              <Slider
                min={0}
                max={1}
                step={0.1}
                value={[temperature]}
                onValueChange={(value) => setTemperature(value[0])}
              />

              <span className="block text-xs text-muted-foreground italic leading-relaxed">
                Valores mais alto tendem a deizar o resultado mais criativo e
                com possiveis erros.
              </span>
            </div>

            <Separator />

            <Button
              disabled={isLoading}
              variant="secondary"
              type="submit"
              className="w-full"
            >
              Executar <Wand2 className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </aside>
      </main>
    </div>
  );
}
