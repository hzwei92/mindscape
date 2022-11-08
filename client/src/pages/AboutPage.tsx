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
                A pseudonymous account has been automatically generated for you.
                Register an email to secure access to this account.
              </li>
              <li>
                Keep tabs on graphs using the numbers in the top right.
                Click a number there to open the corresponding graph.
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
                Suppose you could upvote/downvote the links of the graph 
                to prioritize them for browsing,
                thus helping to direct the flow of attention across the Web.
              </li>
              <li>
                What if you could filter these votes by various demographics
                (e.g. Millenial aged people, citizens of the United States, 
                people who participate in a particular graph, and/or the people you follow)
                to see the information digest of a particular slice of the population?
              </li>
              <li>
                Mindscape.pub is a prototype of a Web browser that explores these ideas 
                and more!
              </li>
            </ul>
            <br/>
            <h1>
              Motivation
            </h1>
            <ul>
              <li>
                Suppose Alice writes a blog post.

                Then, Bob reads it and responds with his own blog post.

                How are Alice's readers to find and read Bob's response?

                Bob can easily link from his post to Alice's,
                but hyperlinks can only be detected and traversed in the forward direction,
                so this doesn't really help.

                The Web2.0 solution would be for Bob to comment on Alice's post 
                with a hyperlink back to his own post.
                However, Alice might not have comments enabled on her blog. 
                Or Alice might choose to 
                censor Bob's comment.

                So, the Web doesn't really have a standardized protocol 
                for replying to one post with another.
              </li>
              <li>
                The underlying cause of this and other issues is the 
                lack of a way to properly apply structure to the posts of the Web.
              </li>
              <li>
                We are developing this new mode of browsing and extending the Web
                in order to give users the ability to organize posts into nested graphs
                in space.
                
                The ability to organize posts like this yields a medium 
                that is more deeply expressive,
                enabling smarter browsing.

                For instance, one would be able to view the replies to a post,
                sorted by the votes of a particular demographic.
              </li>
              <li>
                To harmonize our voices.

                So we can all contribute as citizen journalists.

                For grassroots science and democracy.
              </li>
            </ul>
            <br/>
            <h1>
              Theory
            </h1>
            <ul>
              <li>
                One of the guiding principles in our research and development is
                the idea that we should design information to 
                leverage our physical intuition regarding material in space-time.

                (For instance, today's operating systems 
                typically use the metaphor of nested folders to 
                give the user some material intuition for how 
                a directory tree is structured.)

                This has inspired us to use a model of nested graphs in space, which 
                allows the user to compose posts in two key ways: 
              </li>
              <li>
                Firstly, this type of interface materializes posts as objects 
                that can be moved around in space.

                Thus, one can position posts in a way that uses distance and direction 
                to convey information
                regarding the relationships between posts.
              </li>
              <li>
                Secondly, it provides a new way to link posts: the arrow. 

                While hyperlinks exist embedded within posts as properties of those posts, 
                arrows exist alongside the posts as objects in their own right.

                This results in their having significantly different properties.

                (For instance, a hyperlink can only be traversed in one direction
                while an arrow can be traversed in either direction.)

                By connecting posts with arrows, we place the posts into a graph,
                i.e. an abstract space of arbitrary dimensionality.

                In this kind of space, distance and direction remain meaningful concepts for 
                expressing relationships between posts.
              </li>
              <li>
                Composition of posts is meaningful 
                because it is the application of syntax onto posts.

                Within a post, syntax is applied to simpler expressions, composing them
                to produce more complex expressions.
                
                This is a fundamental, recursive process that occurs in all acts of expression.

                (For instance, one organizes characters into words, 
                words into sentences, sentences into paragraphs, etc.)

                Previously, it was difficult to express oneself in the composition of posts.

                Now, we can define relationships between posts, composing them
                to form graphs.

                Since graphs are nested, each graph is essentially a post in a meta-graph,
                so we unlock not just one additional level of organization,
                but an arbitrary number of levels.
              </li>
              <li>
                The point of composing posts into graphs is to be able to express
                oneself in terms of preexisting posts.
                
                This means that one can easily cite another person's post,
                integrating it into their own statements.

                This in turn means a reduction in redundant posts,
                as people come to rely on common references in their compositions.
              </li>
            </ul>
            <p>
            </p>
            <br/>
            <h1>
              Practice
            </h1>
            <ul>
              <li>
                Mindscape uses a single data type, the arrow, to represent
                both the nodes and the edges of a graph.

                (We can think of each node as an arrow that starts and ends at itself, 
                like identity arrows in category theory.)

                This is significant because it means that each edge has a text fields
                that can be used to label the edge.

                Also, each arrow can be said to connect two arrows. This means
                that we can have arrows between all 3: node and node, node and edge, edge and edge
              </li>
              <li>
              </li>
            </ul>
          </IonCard>
        </IonCardContent>
      </IonCard>
    </IonPage>
  );
};

export default AboutPage;
