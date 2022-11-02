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
              Quickstart
            </h1>
            <ul>
              <li>
              Keep tabs on graphs using the numbers in the top right.
              Click a number there to open the corrsponding graph.
              </li>
              <li>
              A pseudonymous account has been automatically generated for you.
              Register an email to secure access to this account.
              </li>
            </ul>
            <br/>
            <h1>
              Introduction
            </h1>
            <ul>
              <li>
                You know how we browse the Web one page at a time?

                Imagine zooming out to see the pages and links of the Web
                displayed as a directed graph (i.e. a flowchart). 
              </li>
              <li>
                Suppose you could vote on the links of the graph 
                to prioritize them for browsing,
                thus helping to direct the flow of attention through the Web.
              </li>
              <li>
                What if you could filter these votes by various demographics
                (e.g. Millenial aged people, citizens of the United States, 
                people who participate in a particular graph, and/or the people you follow)?
              </li>
              <li>
              Mindscape.pub is a prototype of a Web browser that does just that!
              </li>
            </ul>
            <br/>
            <h1>
              Motivation
            </h1>
            <ul>
              <li>
              It is important for us to upgrade to this mode of browsing and extending the Web
              because doing so would unlock two new ways to 
              express oneself in the organization of posts.
              </li>
              <li>
              Firstly, this type of interface materializes posts as objects 
              that can be moved around in space.

              Thus, one can position posts in a way that uses distance and direction to convey information
              regarding the relationship between posts.
              </li>
              <li>
                Secondly, it provides a new way to link posts: the arrow. 

                An arrow differs from a hyperlink in that the arrow exists alongside the posts,
                while the hyperlink exists embedded within one of the posts.

                This results in their having significantly different properties.

                (For instance, an arrow can be traversed in either direction,
                while a hyperlink can only be traversed in one direction.)

                By connecting posts with arrows, we place the posts into a graph,
                i.e. an abstract space of arbitrary dimensionality.

                In this kind of space, distance and direction remain meaningful concepts for 
                expressing relationships between posts.

                (For instance, the distance between two posts is defined by the paths between them.
                And every arrow points in its own direction, though we can also maintain a global sense of 
                how far upstream or downstream a post is.)
              </li>

              <li>
                We have long been able to compose symbols within posts.
                Now, given these two modes of defining relationships between posts,
                we are also able to compose the posts themselves to form graphs, i.e. megasymbols.

                The composition of posts allows people to
                express themselves in terms of preexisting posts.

                This means a reduction in redundant posts
                as people come to rely on common references.

                It also means that one's posts are very easily cited by others,
                facilitating the weaving of posts into conversation.
              </li>

              <li>

              So we can all be citizen journalists.

              For grassroots science and democracy.
              </li>
            </ul>
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
            <p>
              Suppose Alice writes a blog post.

              Bob reads it and responds with his own blog post.

              How are Alice's readers to find and read Bob's response?

              Bob can easily link from his post to Alice's,
              but hyperlinks can only be detected and traversed in the forward direction,
              so this doesn't help Alice's readers find Bob's post.

              The Web2.0 solution would be for Bob to comment on Alice's post 
              with a hyperlink back to his own post.
              However, Alice might not have comments enabled on her blog. Or Alice might choose to 
              censor Bob's comment.

              So, the Web doesn't provide a reliable way to reply to one
              post with another.

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
