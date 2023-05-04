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
                <div className="max-w-5xl px-4 docs" dangerouslySetInnerHTML={{ __html }} ></div>
            </div>
        </>
    );
}

