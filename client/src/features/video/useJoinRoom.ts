import { gql, useMutation } from "@apollo/client";
import { useIonToast } from "@ionic/react";
import { useContext } from "react";
import { AppContext } from "../../app/App";
import { SpaceContext } from "../space/SpaceComponent";
import { joinVideoRoom } from "./joinVideoRoom";

const JOIN_ROOM = gql`
  mutation JoinRoom($roomName: String!) {
    joinRoom(roomName: $roomName) {
      token
    }
  }
`;

export default function useJoinRoom() {
  const { setRoom } = useContext(AppContext);
  const { abstract } = useContext(SpaceContext);

  const [present] = useIonToast();

  const [join] = useMutation(JOIN_ROOM, {
    onError: err => {
      present(err.message, 1000);
      console.error(err);
    },
    onCompleted: async data => {
      console.log(data);
      if (!abstract?.id) return;
      try {
        const room = await joinVideoRoom(abstract.id, data.joinRoom.token);
        setRoom(room);
      } catch (err: any) {
        present(err.message, 1000);
        console.error(err);
      }
    }
  });

  const joinRoom = () => {
    if (!abstract?.id) return;
    join({
      variables: {
        roomName: abstract.id,
      }
    });
  }

  return { joinRoom };
}