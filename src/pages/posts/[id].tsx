import { GetStaticProps, NextPage } from "next";
import Image from "next/image";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";//GiiHub風にできる
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import Link from "next/link";
import { Components } from "react-markdown";
import PrismTheme from "react-syntax-highlighter";


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


// react-markdownの変換ルールを独自に上書きする設定
//(コードに色を付ける)
const components: Components = {
    // 「本来なら <code> タグで出力する場面」が来たら、代わりにこの関数を実行してね、という指示
  code(props) {
    const { ref, className, children, node, ...rest } = props;
    const match = /language-(\w+)/.exec(className || "");
    console.log("className:", className);

    return match ? (
      <SyntaxHighlighter
        style={vscDarkPlus as unknown as { [key: string]: React.CSSProperties }}
        language={match[1]}
        PreTag="div"
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  },
};
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
  components={components}
  
>
  {content}
</ReactMarkdown>
<Link href={"/"}>戻る</Link>
    </div>
    
  );

}
// 記事内容の動的取得 (SSR)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getServerSideProps = async ({ params }: any) => {
  try {
    const filePath = path.join(process.cwd(), 'src', 'articles', `${params.id}.md`);
    if (!fs.existsSync(filePath)) {
      return { notFound: true };
    }
    
    const markdownWithMeta = fs.readFileSync(filePath, 'utf-8');
    const { data: matterData, content } = matter(markdownWithMeta);
    
    return {
      props: {
        matterData: {
          categories: matterData.categories || "None",
          title: matterData.title || "No Title",
          date: matterData.date || "Unknown",
          convertImage: matterData.convertImage || ""
        },
        slug: params.id,
        content
      }
    };
  } catch (error) {
    return { notFound: true };
  }
}
export default Index;
