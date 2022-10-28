import { IonCard, IonCardContent, IonCardHeader, IonContent, IonHeader, IonPage } from '@ionic/react';
import { useContext } from 'react';
import { AppContext } from '../app/App';

const AboutPage: React.FC = () => {
  const { palette } = useContext(AppContext);

  return (
    <IonPage>
      <IonCard style={{
        backgroundColor: palette === 'dark'
          ? '#000000'
          : '#e0e0e0',
        height: 'calc(100% - 56px)',
        top: 56,
        margin: 0,
        borderRadius: 0,
        overflow: 'scroll',
      }}>
        <IonCardHeader>
          About
        </IonCardHeader>
        <IonCardContent>
          <IonCard style={{
            padding: 10,
            margin: 0,
          }}>
            <h1>
              Intro
            </h1>
            <p>
              You know how we browse the Web one page at a time?

              Imagine zooming out to see the pages and links of the Web
              displayed as a directed graph (i.e. a flowchart). 

              Suppose you could vote on the links of the graph 
              to prioritize them for browsing,
              thus helping to direct the flow of attention through the Web.
              
              What if you could filter these votes by various demographics
              (e.g. Millenial aged people, citizens of the United States, 
              people who participate in a particular graph, and/or people you follow)?
             
              Mindscape.pub is a prototype of a Web browser that does just that.
            </p>
            <br/>
            <h1>
              Motivation
            </h1>
            <p>
              The potential of using a weighted directed graph 
              to structure information has not been fully
              explored in the context of the Web.
              
              Suppose Alice writes a blog post.

              Bob reads it and responds with his own blog post.

              How are Alice's readers to know that Bob's response exists?

              Bob can easily link from his post to Alice's,
              but hyperlinks can only be detected and traversed in the forward direction,
              so this doesn't help Alice's readers to find Bob's post.

              The Web2.0 solution would be for Bob to comment on Alice's post 
              with a hyperlink back to his own post.
              However, Alice might not have comments enabled on her blog. Or Alice might choose to 
              censor Bob's comment.

              So, the Web doesn't provide a reliable way to reply to one
              post with another.


              The problem with Twitter is that (1) they don't implement web structure,
              and (2) they are too reliant on timeline structure and/or feeds where
              adjacency of posts carries no meaning. There is no sense of place, its just 
              a stream of vectors pointing in random directions.

            </p>
            <p>
              In some sense, expressing oneself on the Web is very easy;
              there are many ways to post content to the Web.

              The difficulty lies in organizing these posts.
              
              Organization is meta-expression; 
              to organize a collection of things is to express oneself in terms of those things.



              <br/>
              Within a post, we use spatial positioning to order and group symbols,
              from characters to words to sentences to paragraphs, etc.

              But what about the posts themselves? Are they not just symbols?
              The ability to compose symbols should not be limited at some arbitrary granularity.
              

              <br/>
              We aim to promote grassroots science and democracy 
              by empowering citizen journalists.

              
            </p>
              
              <br/>
              individual vs collective organizational schemes


              Words refer to definitions, are like URLs to pages.

              How to connect things in higher dimensional spaces?

              Use links

            <p>


              organization is key, 
              because of the fundamental concept in computer science that
              sorting facilitates search.

              Search is critical because the Web is so vast. Finding particular posts
              is a necessary step in .

              The more organized something is, the easier it is to organize further.
            Known unknowns and unknown unknowns
            </p>
            <p>
              We hope to make the Web that more 
              expressive, organized, democratic, and transparent
              by enabling the 
              creation, visualization, traversal, promotion, and filtration 
              of links.
            </p>
            <br/>
            <h1>
              Theory
            </h1>
            <p>
              One of the guiding principles in our research and development is
              the idea that we should design information to 
              leverage our physical intuition regarding material in space-time.
            </p>
            <p>
              For instance, today's operating systems 
              typically use the metaphor of nested folders to 
              give the user some material intuition for how 
              a directory tree is structured.
            </p>
            <p>
              However, this metaphor becomes less useful when
              we try to model the Web, which features linkage that is not constrained to a 
              tree structure.
            </p>
            <p>
              While tree structure is useful for determining the position of things, 
              graph structure is more flexible, enabling structure that corresponds  with
              the merging of multiple lines of thought and/or the tagging of content with multiple labels.
            </p>
            <p>
              The underlying data strcuture of mindscape is 
              In our graph editor we integrate the two structures.
              Nodes are positioned in space by a tree
              we define a directory tree structure on each graph 
              to make its content more manageable, 
              but we also materialize links so that they are easy to 
              create, traverse, promote, and filter.
            </p>
            <p>
              By materializing slices of the Web in this way, 
              we gain the ability to express relationships between nodes
              using both spatial positioning and concrete linkage. 
            </p>
            <p>
              The links of a mindscape graph differ from the hyperlinks of the Web
              (i.e. embedded URLs) in that links exist alongside nodes while
              hyperlinks exist embedded within them.
            </p>
            <br/>
            <h1>
              Practice
            </h1>
            <p>
              Mindscape structures its data as a directed graph 
            </p>
            <p>
              Each graph is a node that has been opened for the viewing of its contents.
            </p>
            <p>
              Each graph has a directory tree, indicated by the solid lines between nodes.
            </p>
            <p>
              A user account has automatically been generated for you. 
              Register an email to the account so you can maintain access to it.
            </p>
            <p>
              The graphs that you are viewing are numbered in the top right. 
              Click on a number to view the corresponding graph.
            </p>
          </IonCard>
        </IonCardContent>
      </IonCard>
    </IonPage>
  );
};

export default AboutPage;
