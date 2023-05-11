import { ModuleView } from '~/views/module';

export function ModuleGallery({
  className,
  module
}: {
  className?: string;
  module: ModuleView;
}) {
  return (
    <div className={'grid-flow-row hiddenScroll w-full grid-cols-1 ' + className}>
      <div className="card-image aspect-[3/2] w-full"><img className="inline-block h-full w-auto" src={"/images/" + module.frontpanel} /></div>
      <div className="inline-block w-full h-2"></div>
      {
        module.videos.map((video) => {
          return video.youtube ? <iframe className="w-full aspect-video" src={"https://www.youtube.com/embed/" + video.youtube} title={video.name} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe> : null
        })
      }
    </div>
  );
}
