import { gql } from "@apollo/client";
import { IonCard, IonCardContent, IonCardHeader, IonIcon } from "@ionic/react";
import { checkmarkCircle } from "ionicons/icons";
import md5 from "md5";
import { useContext, useEffect } from "react";
import { AppContext } from "../../app/App";
import { useAppSelector } from "../../app/store";
import { OFF_WHITE } from "../../constants";
import { getTimeString } from "../../utils";
import { selectIdToLead, selectLeaderIdToLeadId, selectFollowerIdToLeadId } from "../lead/leadSlice";
import useGetLeaders from "../lead/useGetLeaders";
import { selectIdToUser } from "../user/userSlice";
import UserTag from "../user/UserTag";


export default function ContactsComponent() {
  const { user, palette, setSelectedUserId } = useContext(AppContext);

  const { getLeaders } = useGetLeaders();

  useEffect(() => {
    if (user?.id) {
      getLeaders(user.id)
    }
  }, []);

  const idToUser = useAppSelector(selectIdToUser);

  const idToLead = useAppSelector(selectIdToLead);

  const leaderIdToLeadId = useAppSelector(selectLeaderIdToLeadId);
  const followerIdToLeadId = useAppSelector(selectFollowerIdToLeadId);

  const leaders = Object.values(leaderIdToLeadId)
    .map(leadId => {
      const lead = idToLead[leadId];
      const leader = idToUser[lead.leaderId];
      return {lead, leader};
    })
    .filter(({lead, leader}) => !!lead && !!leader);

  const followers = Object.values(followerIdToLeadId)
    .map(leadId => {
      const lead = idToLead[leadId];
      const follower = idToUser[lead.followerId];
      return {lead, follower};
    })
    .filter(({lead, follower}) => !!lead && !!follower);

  const handleUserClick = (userId: string) => (event: React.MouseEvent) => {
    event.stopPropagation();
  
    setSelectedUserId(userId);
  }


  return (
    <IonCard style={{
      margin: 0,
      borderRadius: 0,
      backgroundColor: palette === 'dark'
        ? '#000000'
        : OFF_WHITE,
      height: '100%',
      overflowY: 'scroll',
    }}>
      <IonCardHeader style={{
        padding: 10,
      }}>
        CONTACTS
      </IonCardHeader>
      <IonCard style={{
        marginTop: 0,
      }}>
        <IonCardContent>
          <div style={{
            fontWeight: 'bold',
            fontSize: 20,
          }}>
            Leads - {leaders.length}
          </div>
          {
            leaders
              .sort((a, b) => a.leader.activeDate > b.leader.activeDate ? -1 : 1)
              .map(({lead, leader}) => {
                const time = new Date(leader.activeDate).getTime()
                const timeString = getTimeString(time);
                return (
                  <div key={'lead-'+lead.id} style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 5,
                  }}>
                    <UserTag user={leader} fontSize={14} />
                    <div style={{
                      marginLeft: 3,
                    }}>
                      { 
                        timeString === '0sec'
                          ? 'LIVE!'
                          : timeString
                      }
                    </div>
                  </div>
                )
              })
          }
          <div style={{
            fontWeight: 'bold',
            fontSize: 20,
          }}>
            Followers - {followers.length}
          </div>
          {
            followers
              .sort((a, b) => a.follower.activeDate > b.follower.activeDate ? -1 : 1)
              .map(({lead, follower}) => {
                const time = new Date(follower.activeDate).getTime()
                const timeString = getTimeString(time);
                return (
                  <div key={'lead-'+lead.id} style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 5,
                  }}>
                    <UserTag user={follower} fontSize={14} />
                    <div style={{
                      marginLeft: 3,
                    }}>
                      { timeString}
                    </div>
                  </div>
                )
              })
          }
        </IonCardContent>
      </IonCard>
    </IonCard>
  );
}