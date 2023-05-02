import YouTube from 'react-youtube';
import ModalImage from "react-modal-image";
import ModalVideo from "react-modal-video";
import { db } from '~/lib/db'
import {
  Section,
  Grid,
  Button,
  Text,
  Link,
  Modal
} from '~/components';

export default function Patches() {
  return (
    <>
      <Section className="py-0">
        <Grid layout='patches' className="py-0">
          {
            db.patches.map((patch, it) => {
              return (
                <>
                  <div>
                    <Text size="lead" className="w-full uppercase" color="primary">{patch.title}</Text>
                    {patch.videos.map((video) => {
                      return <Link to={'https://www.youtube.com/watch?v=' + video.youtube} target="_blank"><img src={'https://img.youtube.com/vi/' + video.youtube + '/0.jpg'} /></Link>
                    })}
                    <div className="w-full h-2" />
                    {
                      patch.artists && (patch.artists.length > 1 && <p><Text color="primary">Artists </Text>
                        <Text color="subtle">
                          {patch.artists.map((artist, index) => {
                            return (<>
                              {(index != patch.artists.length - 1) ?
                              artist.name + ', ' : artist.name}
                            </>)
                          })}
                        </Text>
                      </p>)
                    }
                    {
                      patch.artists.length == 1 && <p><Text color="primary">Artist </Text>
                        <Text color="subtle">
                          {patch.artists[0].name}
                        </Text>
                      </p>
                    }
                    {/* {
                      patch.modules && (<p><Text color="primary">Modules </Text>
                        <Text color="subtle">
                          {patch.modules.map((module) => {
                            return (<><Link to={'/products/' + module.title.toLowerCase()} >{module.title}</Link> </>)
                          })}
                        </Text>
                      </p>)
                    } */}
                    {
                      patch.modules && (patch.modules.length > 0 && <p><Text color="primary">Modules </Text>
                        <Text color="subtle">
                          {patch.modules.map((module, index) => {
                            return (<>
                              <Link to={'/products/' + module.title.toLowerCase()} >
                                {(index != patch.modules.length - 1) ?
                                module.title + ', ' : module.title}
                              </Link>
                            </>)
                          })}
                        </Text>
                      </p>)
                    }
                    {
                      patch.notes && <Text size="fine" color="subtle" format>{patch.notes}</Text>
                    }
                    {
                      patch.diagram && <ModalImage className="opacity-100 h-8 align-middle" smallSrcSet={patch.diagram} hideDownload={true} hideZoom={true} small={patch.diagram} large={patch.diagram} alt={patch.title + ' Patch Diagram'}/>
                    }
                  </div>
                </>)
            })
          }
        </Grid>
      </Section>
    </>
  );
}

