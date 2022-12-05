import { gql, useMutation } from "@apollo/client";
import { useDispatch } from "react-redux";
import { LEAD_FIELDS } from "./leadFragments";
import { mergeLeads } from "./leadSlice";


const GET_LEADERS = gql`
  mutation GetLeaders($userId: String!) {
    getLeaders(userId: $userId) {
      ...LeadFields
      leader {
        id
        name
        color
        email
        verifyEmailDate
        activeDate
      }
    }
  }
  ${LEAD_FIELDS}
`;

export default function useGetLeads() {
  const dispatch = useDispatch();


  const [get] = useMutation(GET_LEADERS, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);

      dispatch(mergeLeads(data.getLeaders));
    }
  });

  const getLeaders = (userId: string) => {
    get({
      variables: {
        userId
      }
    });
  };

  return { getLeaders };
}