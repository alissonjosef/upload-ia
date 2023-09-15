import { Label } from "@radix-ui/react-label";
import { FileVideo, Upload } from "lucide-react";
import { Button } from "./button";
import { Separator } from "@radix-ui/react-separator";
import { Textarea } from "./textarea";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { api } from "@/lib/axios";

type Status =
  | "waiting"
  | "converting"
  | "uploanding"
  | "generating"
  | "success";

const statusMenssagens = {
  converting: "Convertendo...",
  generating: "Trancrevendo...",
  uploanding: "Carregando...",
  success: "Sucesso...",
};

interface VideoUpload {
  onVideoUpload: (id: string) => void;
}

export function VideoInputForm(props: VideoUpload) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("waiting");

  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget;
    if (!files) {
      return;
    }

    const selectedFile = files[0];

    setVideoFile(selectedFile);
  }

  async function convertVideoToAudio(video: File) {
    console.log("Coverte start");

    const ffmpeg = await getFFmpeg();

    await ffmpeg?.writeFile("input.mp4", await fetchFile(video));

    /*   ffmpeg?.on('log', log => {
      console.log("🚀 ~ file: video-input-form.tsx:34 ~ convertVideoToAudio ~ log:", log)
      
    }) */

    ffmpeg?.on("progress", (progress) => {
      console.log("Convert progress: " + Math.round(progress.progress * 100));
    });

    await ffmpeg?.exec([
      "-i",
      "input.mp4",
      "-map",
      "0:a",
      "-b:a",
      "20k",
      "-acodec",
      "libmp3lame",
      "output.mp3",
    ]);

    const data = await ffmpeg?.readFile("output.mp3");

    const audioFileBlob = new Blob([data], { type: "audio/mpeg" });
    const audioFile = new File([audioFileBlob], "audio.mp3", {
      type: "audio/mpeg",
    });

    console.log("Convert Finished");

    return audioFile;
  }

  async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const prompt = promptInputRef.current?.value;

    if (!videoFile) {
      return;
    }

    setStatus("converting");

    const audioFile = await convertVideoToAudio(videoFile);

    const data = new FormData();

    data.append("file", audioFile);

    setStatus("uploanding");

    const response = await api.post("/videos", data);

    const videoId = response.data.video.id;

    setStatus("generating");

    await api.post(`/videos/${videoId}/transcription`, {
      prompt,
    });

    setStatus("success");
    props.onVideoUpload(videoId);
  }

  const previewURL = useMemo(() => {
    if (!videoFile) {
      return null;
    }

    return URL.createObjectURL(videoFile);
  }, [videoFile]);

  return (
    <form onSubmit={handleUploadVideo} className="space-y-6">
      <label
        htmlFor="video"
        className="border relative flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5"
      >
        {videoFile ? (
          <video
            src={previewURL || undefined}
            controls={false}
            className="point-event-none absolute inset-0"
          />
        ) : (
          <>
            <FileVideo className="w-4 h-4" />
            Selecione um vídeo
          </>
        )}
      </label>

      <input
        type="file"
        id="video"
        accept="video/mp4"
        className="sr-only"
        onChange={handleFileSelected}
      />

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="transcription_prompt">Prompt de transcrição</Label>
        <Textarea
          disabled={status !== "waiting"}
          ref={promptInputRef}
          id="transcription_prompt"
          className="h-20 leading-relaxed resize-none"
          placeholder="Inclu palavras-chaves mercionados no video separado por virgulas (,)"
        />
      </div>

      <Button
        data-success={status === "success"}
        disabled={status !== "waiting"}
        variant="secondary"
        type="submit"
        className="w-full data-[success=true]:bg-blue-600"
      >
        {status === "waiting" ? (
          <>
            Carregando video
            <Upload className="w-4 h-4 ml-2" />
          </>
        ) : (
          statusMenssagens[status]
        )}
      </Button>
    </form>
  );
}
