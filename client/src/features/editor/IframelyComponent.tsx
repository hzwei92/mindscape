import { useEffect, useState} from 'react';
import { IFRAMELY_API_KEY } from '../../constants';

export interface IframelyComponentProps {
  url: string
};

export default function IframelyComponent(props: any) {
  const [error, setError] = useState(null as any);
  const [isLoaded, setIsLoaded] = useState(false);
  const [html, setHtml] = useState({
    __html: '<div />'
  });

  const key = IFRAMELY_API_KEY;

  useEffect(() => {
    if (props.blockProps && props.blockProps.url) {
      fetch(`https://cdn.iframe.ly/api/iframely?url=${encodeURIComponent(props.blockProps.url)}&key=${key}&omit_script=1`)
        .then(res => res.json())
        .then(
          (res) => {
            setIsLoaded(true);
            if (res.html) {
              console.log(res);
              setHtml({__html: `<div><a href='${res.url}' target='_blank' rel='noopener noreferrer'>${res.url}</a>${res.html}</div>`});
            } 
            else if (res.error) {
              setError({code: res.error, message: res.message});
            }
            else {
              setHtml({__html: `<div><a href='${res.url}' target='_blank' rel='noopener noreferrer'>${res.url}</a></div>`});
            }
          },
          (error) => {
            setIsLoaded(true);
            setError(error);
          }
        )
    } 
    else {
      setError({code: 400, message: 'Provide url attribute for the element'})
    }
  }, []);

  useEffect(() => {
    (window as any).iframely && (window as any).iframely.load();
  });

  if (error) {
    return <div>Error: {error.code} - {error.message}</div>;
  } 
  else if (!isLoaded) {
    return <div>Loading...</div>;
  } 
  else {
    return (
      <div 
        dangerouslySetInnerHTML={html} 
        style={{
          width: '100%',
          margin: 0,
        }} 
      />
    );
  }
}
