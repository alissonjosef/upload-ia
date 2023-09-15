import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { api } from "@/lib/axios";

interface Prompt {
  id: string;
  title: string;
  template: string;
}

interface SelectedPrompt {
  onPromptSelected: (template: string) => void;
}

export function PromptSelect(props: SelectedPrompt) {
  const [prompt, setPrompt] = useState<Prompt[] | null>(null);
  console.log("🚀 ~ file: promptSelct.tsx:13 ~ PromptSelect ~ prompt:", prompt);
  useEffect(() => {
    api.get("/prompt").then((res) => {
      setPrompt(res.data);
    });
  }, []);

  function handlePromtSelected(prompsId: string) {
    const selectePrompts = prompt?.find((prompts) => prompts.id === prompsId);

    if (!selectePrompts) {
      return;
    }

    props.onPromptSelected(selectePrompts.template);
  }

  return (
    <Select onValueChange={handlePromtSelected}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione um prompt..." />
      </SelectTrigger>
      <SelectContent>
        {prompt?.map((prompts: any) => {
          return (
            <SelectItem key={prompts.id} value={prompts.id}>
              {prompts.title}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
