import { gql, useMutation } from "@apollo/client";
import { useDispatch } from "react-redux";
import { LEAD_FIELDS } from "./leadFragments";
import { mergeLeads } from "./leadSlice";

const GET_USER_LEADS = gql`
  mutation GetUserLeads($userId: String!) {
    getUserLeads(userId: $userId) {
      leaders {
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
      followers {
        ...LeadFields
        follower {
          id
          name
          color
          email
          verifyEmailDate
          activeDate
        }
      }
    }
  }
  ${LEAD_FIELDS}
`;

export default function useGetUserLeads() {
  const dispatch = useDispatch();

  const [get] = useMutation(GET_USER_LEADS, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);

      const { leaders, followers } = data.getUserLeads;

      dispatch(mergeLeads([...leaders, ...followers]));
    }
  });

  const getUserLeads = (userId: string) => {
    get({
      variables: {
        userId
      }
    });
  };

  return { getUserLeads };
}