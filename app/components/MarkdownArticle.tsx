import { getMarkdownToHTML } from '~/lib/markdown';

export interface MarkdownArticleProps {
    content: string;
}

export const MarkdownArticle = ({
    content = "",
    ...props
}: MarkdownArticleProps) => {
    const __html = getMarkdownToHTML(content)
    return (
        <>
            <div className="flex flex-auto justify-center">
                <article className="prose max-w-prose-wide px-8">
                    <div dangerouslySetInnerHTML={{ __html }} ></div>
                </article>
            </div>
        </>
    );
}

