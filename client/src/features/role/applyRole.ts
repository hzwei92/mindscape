import { ApolloCache, Reference } from '@apollo/client';
import { Role } from './role';
import { ROLE_FIELDS } from './roleFragments';

export const applyRole = (cache: ApolloCache<any>, role: Role) => {
  if (!role) return;
  const newRef = cache.writeFragment({
    id: cache.identify(role),
    fragment: ROLE_FIELDS,
    data: role
  });

  cache.modify({
    id: cache.identify(role.user),
    fields: {
      roles: (cachedRefs, {readField}) => {
        const isPresent = cachedRefs.some((ref: Reference) => {
          return readField('id', ref) === role.id;
        });
        return isPresent
          ? cachedRefs
          : [...cachedRefs, newRef];
      }
    }
  });

  cache.modify({
    id: cache.identify(role.arrow),
    fields: {
      roles: (cachedRefs, {readField}) => {
        const isPresent = cachedRefs.some((ref: Reference) => {
          return readField('id', ref) === role.id;
        });
        return isPresent
          ? cachedRefs
          : [...cachedRefs, newRef];
      }
    }
  });
}