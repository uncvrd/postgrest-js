import { expectType } from 'tsd'
import { PostgrestClient, PostgrestSingleResponse } from '../src/index'
import { SelectQueryError } from '../src/select-query-parser'
import { Prettify } from '../src/types'
import { Database } from './types'
import { selectQueries } from './relationships'
const REST_URL = 'http://localhost:3000'
const postgrest = new PostgrestClient<Database>(REST_URL)

// many-to-one relationship
{
  const { data: message, error } = await selectQueries.manyToOne.single()
  if (error) {
    throw new Error(error.message)
  }
  expectType<Database['public']['Tables']['users']['Row'] | null>(message.user)
}

// !inner relationship
{
  const { data: message, error } = await selectQueries.inner
    .single()
  if (error) {
    throw new Error(error.message)
  }
  type ExpectedType = Prettify<
    Database['public']['Tables']['channels']['Row'] & {
      channel_details: Database['public']['Tables']['channel_details']['Row']
    }
  >

  expectType<ExpectedType>(message.channels)
}

// one-to-many relationship
{
  const { data: user, error } = await selectQueries.oneToMany.single()
  if (error) {
    throw new Error(error.message)
  }
  expectType<Database['public']['Tables']['messages']['Row'][]>(user.messages)
}

// one-to-one relationship
{
  const { data: channels, error } = await selectQueries.oneToOne
    .single()
  if (error) {
    throw new Error(error.message)
  }
  expectType<Database['public']['Tables']['channel_details']['Row'] | null>(
    channels.channel_details
  )
}

// !left oneToOne
{
  const { data: oneToOne, error } = await selectQueries.leftOneToOne
    .single()

  if (error) {
    throw new Error(error.message)
  }

  // TODO: this should never be nullable
  expectType<Database['public']['Tables']['channels']['Row'] | null>(oneToOne.channels)
}

// !left oneToMany
{
  const { data: oneToMany, error } = await selectQueries.leftOneToMany
    .single()

  if (error) {
    throw new Error(error.message)
  }

  expectType<Array<Database['public']['Tables']['messages']['Row']>>(oneToMany.messages)
}

// !left zeroToOne
{
  const { data: zeroToOne, error } = await selectQueries.leftZeroToOne
    .single()

  if (error) {
    throw new Error(error.message)
  }

  expectType<Database['public']['Tables']['users']['Row'] | null>(zeroToOne.users)
}

// join over a 1-1 relation with both nullables and non-nullables fields using foreign key name for hinting
{
  const { data: bestFriends, error } = await selectQueries.joinOneToOneWithFkHint
    .single()

  if (error) {
    throw new Error(error.message)
  }

  // TODO: Those two fields shouldn't be nullables
  expectType<Database['public']['Tables']['users']['Row'] | null>(bestFriends.first_user)
  expectType<Database['public']['Tables']['users']['Row'] | null>(bestFriends.second_user)
  // The third wheel should be nullable
  expectType<Database['public']['Tables']['users']['Row'] | null>(bestFriends.third_wheel)
}

// join over a 1-M relation with both nullables and non-nullables fields using foreign key name for hinting
{
  const { data: users, error } = await selectQueries.joinOneToManyWithFkHint
    .single()

  if (error) {
    throw new Error(error.message)
  }
  // TODO: type properly the result for this kind of queries
  expectType<Array<{}>>(users.first_friend_of)
}

// join on 1-M relation
{
  const { data, error } = await selectQueries.joinOneToManyUsersWithFkHint
    .single()

  if (error) {
    throw new Error(error.message)
  }
  // TODO: properly infer the type for this kind of queries should be
  expectType<Array<Database['public']['Tables']['best_friends']['Row']>>(data.first_friend_of)
  expectType<Array<Database['public']['Tables']['best_friends']['Row']>>(data.second_friend_of)
  expectType<Array<Database['public']['Tables']['best_friends']['Row']>>(data.third_wheel_of)
}

// join on 1-1 relation with nullables
{
  const { data, error } = await selectQueries.joinOneToOneWithNullablesFkHint
    .single()

  if (error) {
    throw new Error(error.message)
  }
  // TODO: Those should not be nullables
  expectType<Database['public']['Tables']['users']['Row'] | null>(data.first_user)
  expectType<Database['public']['Tables']['users']['Row'] | null>(data.second_user)
  // This one might be null
  expectType<Database['public']['Tables']['users']['Row'] | null>(data.third_wheel)
}

// join over a 1-1 relation with both nullables and non-nullables fields with no hinting
{
  const { data, error } = await selectQueries.joinOneToOneWithNullablesNoHint
    .single()

  if (error) {
    throw new Error(error.message)
  }
  expectType<SelectQueryError<"Could not embed because more than one relationship was found for 'users' and 'best_friends' you need to hint the column with users!<columnName> ?">>(data.first_user)
}

// join over a 1-1 relation with both nullablesand non-nullables fields with column name hinting
{
  const { data, error } = await selectQueries.joinOneToOneWithNullablesColumnHint
    .single()

  if (error) {
    throw new Error(error.message)
  }
  expectType<Database['public']['Tables']['users']['Row'] | null>(data.first_user)
  expectType<Database['public']['Tables']['users']['Row'] | null>(data.second_user)
  expectType<Database['public']['Tables']['users']['Row'] | null>(data.third_wheel)
}

// join over a 1-M relation with both nullables and non-nullables fields with no hinting
{
  const { data, error } = await selectQueries.joinOneToManyWithNullablesNoHint
    .single()

  if (error) {
    throw new Error(error.message)
  }
  expectType<SelectQueryError<"Could not embed because more than one relationship was found for 'best_friends' and 'users' you need to hint the column with best_friends!<columnName> ?">>(data.first_friend_of)
}

// join over a 1-M relation with both nullables and non-nullables fields using column name for hinting
{
  const { data, error } = await selectQueries.joinOneToManyWithNullablesColumnHint
    .single()

  if (error) {
    throw new Error(error.message)
  }
  expectType<Array<Database['public']['Tables']['best_friends']['Row']>>(data.first_friend_of)
  expectType<Array<Database['public']['Tables']['best_friends']['Row']>>(data.second_friend_of)
  expectType<Array<Database['public']['Tables']['best_friends']['Row']>>(data.third_wheel_of)
}

// join over a 1-M relation with both nullables and non-nullables fields using column name hinting on nested relation
{
  const { data, error } = await selectQueries.joinOneToManyWithNullablesColumnHintOnNestedRelation
    .single()

  if (error) {
    throw new Error(error.message)
  }
  expectType<Array<Database['public']['Tables']['best_friends']['Row']>>(data.first_friend_of)
  expectType<Array<Database['public']['Tables']['best_friends']['Row']>>(data.second_friend_of)
  expectType<Array<Database['public']['Tables']['best_friends']['Row']>>(data.third_wheel_of)
}

// join over a 1-M relation with both nullables and non-nullables fields using no hinting on nested relation
{
  const { data, error } = await selectQueries.joinOneToManyWithNullablesNoHintOnNestedRelation
    .single()

  if (error) {
    throw new Error(error.message)
  }
  expectType<SelectQueryError<"Could not embed because more than one relationship was found for 'users' and 'best_friends' you need to hint the column with users!<columnName> ?">>(data.first_friend_of[0].first_user)
}

// !left join on one to 0-1 non-empty relation
{
  const { data, error } = await selectQueries.leftOneToOneUsers.single()

  if (error) {
    throw new Error(error.message)
  }
  expectType<Array<Pick<Database['public']['Tables']['user_profiles']['Row'], 'username'>>>(data.user_profiles)
}

// !left join on zero to one with null relation
{
  const { data, error } = await selectQueries.leftZeroToOneUserProfiles.single()

  if (error) {
    throw new Error(error.message)
  }
  expectType<Database['public']['Tables']['users']['Row'] | null>(data.users)
}

// !left join on zero to one with valid relation
{
  const { data, error } = await selectQueries.leftZeroToOneUserProfilesWithNullables.single()

  if (error) {
    throw new Error(error.message)
  }
  expectType<Pick<Database['public']['Tables']['users']['Row'], 'status'> | null>(data.users)
}

// !left join on zero to one empty relation
{
  const { data, error } = await selectQueries.leftOneToOneUsers.single()

  if (error) {
    throw new Error(error.message)
  }
  expectType<Array<Pick<Database['public']['Tables']['user_profiles']['Row'], 'username'>>>(data.user_profiles)
}

// join on 1-M relation with selective fk hinting
{
  const { data, error } = await selectQueries.joinOneToManyUsersWithFkHintSelective.limit(1).single()

  if (error) {
    throw new Error(error.message)
  }
  expectType<Array<Pick<Database['public']['Tables']['best_friends']['Row'], 'id'>>>(data.first_friend_of)
  expectType<Array<Database['public']['Tables']['best_friends']['Row']>>(data.second_friend_of)
  expectType<Array<Database['public']['Tables']['best_friends']['Row']>>(data.third_wheel_of)
}