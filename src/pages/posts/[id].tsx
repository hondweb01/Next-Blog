import { GetStaticProps, NextPage } from "next";
import Image from "next/image";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";//GiiHub風にできる
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

/**
 * Propsで受け取る型を定義する
 */
type Props = {
  matterData: {
    categories: string[];
    title: string;
    date: string;
    convertImage: string;
  };
  content: string;
  slug: string; 
};
/**
 * 取ってきた記事を表示する
 * 
 * @param param0 メタデータ　記事の本文
 * @returns コンポーネント
 */
const Index: NextPage<Props>=({ matterData, content })=>{
  
  return (
    <div style={{
    maxWidth: "900px",
    margin: "0 auto",
    padding: "20px"
  }}>
      <h1 >タイトル：{matterData.title}</h1>
      <p>投稿日：{matterData.date}</p>
      <p>タグ：{matterData.categories}</p>
      
      {/* 
      remarkGfm→コードブロック用
      remarkBreaks→改行
       */}
       {/**
        * 以下はマークダウン関連のプラグインなので気にしない
        */

       }
<ReactMarkdown
  remarkPlugins={[remarkGfm,remarkBreaks]}
  components={{
    code({ inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");

      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code {...props}>{children}</code>
      );
    },
  }}
>
  {content}
</ReactMarkdown>
    </div>
  );

}
/**
 * 記事にするmdファイルの取得
 * @returns mdファイルのpath
 */
export const getStaticPaths= async()=>{
    const newsFiles=fs.readdirSync(
        path.join('src','articles'),
    );
    const paths=newsFiles.map((fileName)=>({
    params:{
        id: fileName.replace(/\.md$/, '')
    },

    }));

return{
    paths,
    fallback:false,
};
};
//記事内容の取得
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getStaticProps =async({params}:any)=>{
    const markdownWithMeta=fs.readFileSync(
        path.join('src','articles',`${params.id}.md`),
        'utf-8',
    );
    const {data:matterData,content}=matter(markdownWithMeta);
    return {props:{matterData,slug:params.id,content}};
}
  export default Index;
/**
 * ① getStaticPaths 実行
   ↓
② どのURLを作るか決める
   ↓
③ getStaticProps 実行（URLごと）
   ↓
④ ページ生成
 * 
 */
