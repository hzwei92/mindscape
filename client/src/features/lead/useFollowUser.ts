import { gql, useMutation } from '@apollo/client';
import { useAppDispatch } from '../../app/store';
import { LEAD_FIELDS } from './leadFragments';
import { mergeLeads } from './leadSlice';

const FOLLOW_USER = gql`
  mutation FollowUser($userId: String!) {
    followUser(userId: $userId) {
      ...LeadFields
      leader {
        id
        name
        routeName
        color
        email
        verifyEmailDate
      }
    }
  }
  ${LEAD_FIELDS}
`;
export default function useFollowUser() {
  const dispatch = useAppDispatch();

  const [follow] = useMutation(FOLLOW_USER, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeLeads([data.followUser]));
    },
  });

  const followUser = (userId: string) => {
    follow({
      variables: {
        userId,
      }
    });
  }
  
  return { followUser }
}