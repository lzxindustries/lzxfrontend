export const dot = `digraph structs {node [shape=record];
  {
  
   ang [label="Angles|{ 
   { <ai> A | <bi> B |<ci> C | <di> D }| 
   { <bo> 30 | <do> 60 | <jo> 150 } } } "];
  
   dsg [label =  "DSG3|{
   { <oao> 1 ABS }}} "];
  
   dwo [label="DWO3|{
   {    <oso> 1 Sin | <tso> 2 Sin }}} "];
  
   key [label="Keychain |{ 
      { <rci> CV 1 | <gci> 2 | <bci> 3 | <rki> Key 1 } |
     {  <ro> Out 1 | <go> 2 | <bo> 3}}}"];
  
   smx [label=   "SMX3|{
   { <ari> A R | <agi> G | <abi> B  }|
     { <rgbo> RGB }}}"];
  
   esg [label="ESG3|{ 
   {  <rgbi> RGB }|
   {  <co> Component }}}"];
  
   pro [label="Proc |{ 
     { < ari> A 1 | <bri> B 1 } |
   { <ro> Out 1 }}}"];
  
   pen [label="Pendulum |{ 
   {   < ao> LFO A | <bo> LFO B }}}"];
   
  pen2 [label="Pendulum |{ 
   {   < ao> LFO A  }}}"];
  
  dwo:oso -> pro:ari
  dwo:tso -> pro:bri
  
  pro:ro -> key:rki
  
  pen:ao -> ang:ai
  pen:bo -> ang:bi
  dsg:oao -> ang:ci
  pen2:ao -> ang:di
  
  ang:bo -> key:rci
  ang:do -> key:gci
  ang:jo -> key:bci
  
  key:ro -> smx:ari
  key:go -> smx:agi
  key:bo -> smx:abi
   
  smx:rgbo -> esg:rgbi
  
  esg:co -> "main out"
  
  }}`;

import Graphviz from 'graphviz-react';
const GraphvizPage = () => {
  return <Graphviz dot={dot} />;
};

export default GraphvizPage;
