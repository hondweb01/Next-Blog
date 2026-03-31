import dynamic from "next/dynamic";
const ReactSimpleMdEditor = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

import "easymde/dist/easymde.min.css";
import { useState } from "react";

export const MarkdownEditor = () => {
  const [markdownValue, setMarkdownValue] = useState("");

  const onChange = (value: string) => {
    setMarkdownValue(value);
  };

  //作った記事の内容を送る
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const title = formData.get("title") as string;
    const date = formData.get("date") as string;
    const mainImage=(formData.get("main-image") as File).name;
    const tag=formData.get("tag") as string;
    console.log("imgの中身"+mainImage);
    //const imagePath=mainImage.replace(/\.*$/, '');


    const res = await fetch("/api/createMd", {
      method: "POST",
      body: JSON.stringify({
        title,
        date,
        content: markdownValue,
        tag,
        mainImage
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    console.log(data);
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
            タイトル：
        <input type="text" placeholder="タイトル" name="title" style={{width: "90%",height:"80px"}}></input>
        </div>
        <div>
        投稿日：
        <input type="date" name="date"></input>
        </div>
        
        <div>
        サムネイルの画像：
        <input type="file" name="main-image" />
        </div>
        <div>
          <span>タグの追加：</span>
          <select name="tag">
            <option value="1">日常</option>
            <option value="2">技術</option>
          </select>
        </div>

        <ReactSimpleMdEditor
          value={markdownValue}
          onChange={onChange}
          className="md"
        />
        <button type="submit">送信</button>
      </form>
    </>
  );
};
