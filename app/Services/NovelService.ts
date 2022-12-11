import NovelPublishStatus from 'App/Enums/NovelPublishStatus'
import Novel from 'App/Models/Novel'
import User from 'App/Models/User'

type NovelOnViewRequestInputs = {
  page: number
  take: number
  tags: number[]
  fields: string[]
  filter: string
  publish_status: NovelPublishStatus
}

export default class NovelService {
  public static async onList(user: User, isAdmin: boolean, inputs: NovelOnViewRequestInputs) {
    const novelsQuery = Novel.query()

    if (!isAdmin) {
      novelsQuery.where('publish_status', NovelPublishStatus.PUBLISHED)
    } else {
      novelsQuery.preload('user')

      if (inputs.publish_status) {
        novelsQuery.where('novels.publish_status', inputs.publish_status)
      }
    }

    if (inputs.filter) {
      novelsQuery
        .where('name', 'ilike', `%${inputs.filter}%`)
        .orWhere('other_names', 'ilike', `%${inputs.filter}%`)
        .orWhere('shorthand', 'ilike', `%${inputs.filter}%`)
    }

    if (inputs.tags) {
      const tags = String(inputs.tags).split(',')

      for (const tag of tags) {
        novelsQuery.whereExists((query) => {
          query
            .select('*')
            .from('novel_tag')
            .whereColumn('novel_tag.novel_id', 'novels.id')
            .where('novel_tag.tag_id', tag)
        })
      }
    }

    const novels = await novelsQuery
      .preload('country')
      .preload('latest_chapter', (query) => {
        query.preload('volume')
      })
      .orderBy('id', 'desc')
      .paginate(inputs.page, inputs.take)

    const fields = String(inputs.fields)
      .split(',')
      ?.filter((x) => x !== 'context')

    if (fields) {
      const novelsJSON = novels.toJSON()

      return {
        have_fields: true,

        novels: {
          ...novelsJSON,
          data: novelsJSON.data.map((novel) => {
            const result = {}
            for (const field of fields) {
              result[field] = novel[field]
            }
            return result
          }),
        },
      }
    }

    return { novels, have_fields: false }
  }
}
