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
      <div className="card-image aspect-square w-full"><img className="inline-block h-full w-auto" src={"/images/" + module.frontpanel} /></div>
    </div>

  );
}
