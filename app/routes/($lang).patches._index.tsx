import YouTube from 'react-youtube';
import { db } from '~/lib/db'
import {
  Section,
  Grid,
  Button,
  Text,
  Link,
} from '~/components';

export default function Patches() {
  return (
    <>
      <Section className="py-0">
        <Grid layout='patches' className="py-0">
          {
            db.patches.map((patch) => {
              return (
                <>
                  <div>
                    <Text size="lead" className="w-full uppercase" color="primary">{patch.title}</Text>
                    {patch.videos.map((video) => {
                      return <Link to={'https://www.youtube.com/watch?v=' + video.youtube} target="_blank"><img src={'https://img.youtube.com/vi/' + video.youtube + '/0.jpg'} /></Link>
                      //return <YouTube className="aspect-video" opts={{ height: 90, width: 160, playerVars: { autoplay: 1 } }} iframeClassName="aspect-video" videoId={video.youtube} />
                    })}
                    {/* <Link target="_blank" to={patch.diagram}><img className="h-16" src={patch.diagram} /></Link> */}
                    <div className="w-full h-2" />
                    {
                      patch.diagram && <Link target="_blank" to={patch.diagram}><Button width="full" variant="secondary">Diagram</Button></Link>
                    }
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
                  </div>
                </>)
            })
          }
        </Grid>
      </Section>
    </>
  );
}

