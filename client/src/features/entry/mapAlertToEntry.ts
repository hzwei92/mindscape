import { v4 } from "uuid";
import { IdToType } from "../../types";
import { Alert, AlertReason } from "../alerts/alert";
import { Arrow } from "../arrow/arrow";
import { User } from "../user/user";
import { Entry } from "./entry";


export const mapAlertToEntry = (user: User | null, idToArrow: IdToType<Arrow>, alerts: Alert[]) => {
  const idToEntry: IdToType<Entry> = {};
  const entryIds: string[] = [];

  const sourceIdToAlerts = alerts.reduce((acc, alert) => {
    if (alert.source?.id) {
      acc[alert.source.id] = [
        ...(acc[alert.source.id] ?? []),
        alert
      ];
    }
    return acc;
  }, {} as IdToType<Alert[]>);


  Object.keys(sourceIdToAlerts).forEach(sourceId => {
    sourceIdToAlerts[sourceId].sort((a, b) => (a.link?.saveDate ?? '') > (b.link?.saveDate ?? '') ? -1 : 1);
  })

  Object.keys(sourceIdToAlerts)
  .sort((a, b) => {
    const aLink = sourceIdToAlerts[a][0].link;
    const bLink = sourceIdToAlerts[b][0].link;
    return (aLink?.saveDate ?? '') > (bLink?.saveDate ?? '') ? -1 : 1;
  })
  .forEach(sourceId => {
    const alerts = sourceIdToAlerts[sourceId]
      .sort((a, b) => 
        (a.link?.saveDate ?? '') > (b.link?.saveDate ?? '') ? -1 : 1
      );

    const { source } = alerts[0];

    if (!source) return;

    const sourceEntry: Entry = {
      id: v4(),
      userId: source.userId,
      parentId: null,
      arrowId: source.id,
      showIns: false,
      showOuts: !!alerts.length,
      inIds: [],
      outIds: [],
      sourceId: null,
      targetId: null,
      shouldGetLinks: false,
      isDeleted: false,
    };

    idToEntry[sourceEntry.id] = sourceEntry;

    
    alerts.forEach(alert => {
      const { link, source, target, lead, role, abstractRole, reason } = alert;

      let linkBonus: string[] = [];
      let targetBonus: string[] = [];

      if (reason !== AlertReason.FEED) {
        if (lead?.leaderId === link?.userId) {
          linkBonus.push('Written by a user you follow');
        }

        if (source?.userId === user?.id) {
          linkBonus.push('In response to an arrow you wrote');
        }
        else if (role?.arrowId === sourceId) {
          linkBonus.push('In response to an arrow you subscribe to');
        }

        if (abstractRole?.arrowId === link?.abstractId) {
          linkBonus.push('Within a graph you subscribe to');
        }
      }


      if (link?.id && target?.id) {
        const targetEntryId = v4();

        const linkEntry: Entry = {
          id: v4(),
          userId: link.userId,
          parentId: sourceEntry.id,
          arrowId: link.id,
          showIns: false,
          showOuts: false,
          inIds: [],
          outIds: [],
          sourceId: sourceEntry.id,
          targetId: targetEntryId,
          shouldGetLinks: false,
          isDeleted: false,
          bonusText: linkBonus,
        };

        sourceEntry.outIds.push(linkEntry.id);

        idToEntry[linkEntry.id] = linkEntry;

        const targetEntry: Entry = {
          id: targetEntryId,
          userId: target.userId,
          parentId: linkEntry.id,
          arrowId: target.id,
          showIns: false,
          showOuts: false,
          inIds: [],
          outIds: [],
          sourceId: null,
          targetId: null,
          shouldGetLinks: false,
          isDeleted: false,
          bonusText: targetBonus,
        };

        idToEntry[targetEntry.id] = targetEntry;
      }
    })

    entryIds.push(sourceEntry.id);
  });
    
  return {
    idToEntry,
    entryIds,
  }
}