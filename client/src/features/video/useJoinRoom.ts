import { gql, useMutation } from "@apollo/client";
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

  const [join] = useMutation(JOIN_ROOM, {
    onError: err => {
      console.error(err);
    },
    onCompleted: async data => {
      console.log(data);
      if (!abstract?.id) return;
      const room = await joinVideoRoom(abstract.id, data.joinRoom.token);
      setRoom(room);
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