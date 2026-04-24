type ForumArchiveTopicLike = {
  title: string;
  url: string;
  excerpt: string;
  sections: Array<{title: string}>;
  imageUrls: string[];
  views: number;
  postsCount: number;
};

type ProductForumArchiveLike = {
  officialTopic: ForumArchiveTopicLike | null;
  relatedTopics: ForumArchiveTopicLike[];
};

export function ForumArchiveSupportSection({
  archive,
  manualPath,
}: {
  archive: ProductForumArchiveLike | null;
  manualPath: string;
}) {
  if (!archive) return null;

  const officialTopic = archive.officialTopic;
  const relatedTopics = archive.relatedTopics;
  const visibleRelatedTopics = relatedTopics.slice(0, 12);
  const hiddenRelatedTopicCount =
    relatedTopics.length - visibleRelatedTopics.length;

  return (
    <>
      {officialTopic ? (
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-3">Archived Community Guide</h3>
          <div className="rounded-xl border border-base-300 bg-base-200 p-5">
            <p className="text-sm text-base-content/80 mb-4">
              {officialTopic.excerpt}
            </p>

            {officialTopic.imageUrls.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 mb-4">
                {officialTopic.imageUrls.slice(0, 2).map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt={officialTopic.title}
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            ) : null}

            {officialTopic.sections.length > 0 ? (
              <div className="mb-4 flex flex-wrap gap-2">
                {officialTopic.sections.slice(0, 6).map((section) => (
                  <span key={section.title} className="badge badge-outline">
                    {section.title}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <a href={manualPath} className="btn btn-sm btn-primary">
                Open Archived Guide
              </a>
              <a
                href={officialTopic.url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline"
              >
                Original Thread
              </a>
            </div>
          </div>
        </section>
      ) : null}

      {relatedTopics.length > 0 ? (
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-3">Related Discussions</h3>
          <p className="mb-3 text-sm text-base-content/70">
            {officialTopic
              ? `Compiled archive includes ${
                  relatedTopics.length
                } related discussion${relatedTopics.length === 1 ? '' : 's'}.`
              : `Compiled archive is built from ${
                  relatedTopics.length
                } related discussion${relatedTopics.length === 1 ? '' : 's'}.`}
          </p>
          <div className="grid gap-3">
            {visibleRelatedTopics.map((topic) => (
              <a
                key={topic.url}
                href={topic.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-base-300 p-4 transition hover:bg-base-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{topic.title}</p>
                    <p className="text-sm text-base-content/70 mt-1">
                      {topic.excerpt}
                    </p>
                  </div>
                  <span className="badge badge-ghost shrink-0">
                    {topic.postsCount} posts
                  </span>
                </div>
                <div className="mt-3 text-xs text-base-content/50">
                  {topic.views.toLocaleString()} views
                </div>
              </a>
            ))}
          </div>
          {hiddenRelatedTopicCount > 0 ? (
            <p className="mt-3 text-sm text-base-content/60">
              {hiddenRelatedTopicCount} additional archived discussion
              {hiddenRelatedTopicCount === 1 ? '' : 's'} are included in the
              compiled manual.
            </p>
          ) : null}
          <div className="mt-4">
            <a href={manualPath} className="btn btn-sm btn-outline">
              Open Full Archive
            </a>
          </div>
        </section>
      ) : null}
    </>
  );
}
