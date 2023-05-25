import Factory from '@ioc:Adonis/Lucid/Factory'
import ChapterPublishStatus from 'App/Enums/ChapterPublishStatus'
import Chapter from 'App/Models/Chapter'
import CommentFactory from 'Database/factories/CommentFactory'
import NovelFactory from 'Database/factories/NovelFactory'
import UserFactory from 'Database/factories/UserFactory'
import VolumeFactory from 'Database/factories/VolumeFactory'

let number = 0
const novelChapters = {}

export default Factory.define(Chapter, ({ faker }) => {
  return {
    title: faker.lorem.sentence(4),
    context: faker.lorem.paragraphs(10),
    translation_note: faker.lorem.paragraphs(1),
    is_mature: faker.datatype.boolean(),
    is_premium: faker.datatype.boolean(),
    publish_status: faker.helpers.arrayElement(Object.values(ChapterPublishStatus)),
    editor: faker.name.fullName(),
    translator: faker.name.fullName(),
  }
})
  .relation('novel', () => NovelFactory)
  .relation('volume', () => VolumeFactory)
  .relation('readUsers', () => UserFactory)
  .relation('comments', () => CommentFactory)
  .state('published', async (item) => {
    item.publish_status = ChapterPublishStatus.PUBLISHED
  })
  .before('create', (factory, model, ctx) => {
    if (model.number === undefined) {
      if (!novelChapters[model?.novel_id]) {
        novelChapters[model?.novel_id] = true
        number = 0
      }
      model.number = ++number
    }
  })
  .build()

/*
  import Factory from '@ioc:Adonis/Lucid/Factory'
import ChapterPublishStatus from 'App/Enums/ChapterPublishStatus'
import Chapter from 'App/Models/Chapter'
import CommentFactory from 'Database/factories/CommentFactory'
import NovelFactory from 'Database/factories/NovelFactory'
import UserFactory from 'Database/factories/UserFactory'
import VolumeFactory from 'Database/factories/VolumeFactory'

let number = 0
const novelChapters = {}

export default Factory.define(Chapter, ({ faker }) => {
  return {
    title: faker.lorem.sentence(4),
    context: `Claire oturup, öğle yemeği için hazırlanırken Llystletein Otoritesini etkinleştirdi. Bu beceri, onun için sıcak bir yemek elde etmenin tek yoluydu. Çevresinde öldürebileceği hemen her şeyi pişirmek için ihtiyaç duyduğu odunlar vardı ama ne ateş yakma konusunda bilgisi ne de mutfak sanatları konusunda deneyimi vardı.

**Llystletein Otoritesi**

**Eylemler**

**-** ~~**Güvenli Bölge Oluştur**~~ **(Bekleme Süresi: 6 gün)**

**Üretilebilir İçecekler**

**- Cosmogoblitan (50MP)**

**- Mimicosa☆ (500MP)**

**- Bayat Su (25MP)**

_Mimicosa hep bu kadar pahalı mıydı? Ve neden bir yıldız var?_

**Üretilebilir Yiyecekler**

**- YENİ \*Kızarmış Kurbağacık Kanatları (300MP)**

**- Izgara Dunkuz Kuyruğu (200MP)**

**- Bolonez Soslu Cehennem Domuzu (500MP)**

**- Didiklenmiş Ork (150MP)**

**- Bayat Ekmek (25MP)**

_Kanat mı? Kurbağa eti olduğu için biraz şüpheciyim ama daha çok kuş kanadına benziyorlardı. Belki de denemeliyim. En kötü ihtimalle 300MP'yi boşa harcamış olurum ve harcayacak başka bir şeyim de yok_.`,
    translation_note: faker.lorem.paragraphs(1),
    is_mature: faker.datatype.boolean(),
    is_premium: faker.datatype.boolean(),
    publish_status: faker.helpers.arrayElement(Object.values(ChapterPublishStatus)),
    editor: faker.name.fullName(),
    translator: faker.name.fullName(),
  }
})
  .relation('novel', () => NovelFactory)
  .relation('volume', () => VolumeFactory)
  .relation('readUsers', () => UserFactory)
  .relation('comments', () => CommentFactory)
  .state('published', async (item) => {
    item.publish_status = ChapterPublishStatus.PUBLISHED
  })
  .before('create', (factory, model, ctx) => {
    if (model.number === undefined) {
      if (!novelChapters[model?.novel_id]) {
        novelChapters[model?.novel_id] = true
        number = 0
      }
      model.number = ++number
    }
  })
  .build()

  */
