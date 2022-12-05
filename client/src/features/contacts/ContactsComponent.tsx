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
        <IonCardHeader style={{
          fontWeight: 'bold',
        }}>
          Leads
        </IonCardHeader>
        <IonCardContent>
          {
            Object.values(leaderIdToLeadId)
              .map(leadId => {
                const lead = idToLead[leadId];
                const leader = idToUser[lead.leaderId];
                return {lead, leader};
              })
              .sort((a, b) => a.leader.activeDate > b.leader.activeDate ? -1 : 1)
              .map(({lead, leader}) => {
                const time = new Date(leader.activeDate).getTime()
                const timeString = getTimeString(time);
                return (
                  <div key={'lead-'+lead.id} style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    {
                      leader.verifyEmailDate && leader.email
                        ? <img 
                            src={`https://www.gravatar.com/avatar/${md5(leader.email)}?d=retro`}
                            style={{
                              marginTop: -1,
                              marginRight: 2,
                              borderRadius: 7,
                              border: `1px solid ${leader.color}`,
                              width:14,
                              height: 14,
                            }}
                          />
                        : null
                    }
                    <div onClick={handleUserClick(leader.id)} style={{
                      color: leader.color,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}>
                      { leader.name }
                    </div>
                    <IonIcon icon={checkmarkCircle} style={{
                      marginTop: -1,
                      marginLeft: 1,
                      color: user?.color || null,
                      fontSize: 14,
                    }}/>
                    <div>
                      &nbsp;
                      { timeString }
                    </div>
                  </div>
                )
              })
          }
        </IonCardContent>
      </IonCard>
      <IonCard style={{
        marginTop: 0,
      }}>
        <IonCardHeader style={{
          fontWeight: 'bold',
        }}>
          Followers
        </IonCardHeader>
        <IonCardContent>
          {
            
          }
        </IonCardContent>
      </IonCard>
    </IonCard>
  );
}