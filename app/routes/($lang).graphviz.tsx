// import dynamic from 'next/dynamic';

// const Graphviz = dynamic(() => import('graphviz-react'), { ssr: false });
import Graphviz from 'graphviz-react'
const GraphvizPage = () => {
  const dot = 'graph{a--b}';

  return <Graphviz dot={dot} />;
}

export default GraphvizPage;