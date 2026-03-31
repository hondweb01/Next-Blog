import { GetStaticProps, NextPage } from "next";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

type Props = {
  articles: article[];
};
type article = {
  slug: string;
  content: string;
  matterData: {
    categories: string[];
    title: string;
    date: string;
    excerpt: string;
    convertImage: string;
  };
};
const Index: NextPage<Props> = ({ articles }) => {
  return (
    <div>
      {articles.map((a) => (
        // eslint-disable-next-line react/jsx-key
        <div>
          <div>{a.slug}</div>
          <div>{a.matterData.date}</div>
          <div>{a.content}</div>
        </div>
      ))}
    </div>
  );
};
/**
 * 必ずpropsとして返す
 * @returns 
 */
export const getStaticProps: GetStaticProps = async () => {
    //記事フォルダの参照
  const files = fs.readdirSync(path.join('src', 'articles'));
  const articles=files.map((filename)=>{
    //ファイル名から.mdを取り除いて保存
    const slug=filename.replace(/\.md$/, '');
     // mdファイルからファイル内の情報を取得
    const markdownWithMeta=fs.readFileSync(
        path.join('src','articles',filename),
        'utf-8',
    );
    //gray-matterを使用してファイルから必要情報を取得
    // gray-matterはfront matterのYAML解析しjson形式で取得を行うライブラリ
    const {data:matterData,content}=matter(markdownWithMeta);
      return { slug,matterData,content};
      
  });
  return {
    props: {
      articles,
    },
  };
};
export default Index;
