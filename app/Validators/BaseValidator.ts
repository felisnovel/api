import { CustomMessages } from '@ioc:Adonis/Core/Validator'
const PASSWORD_REGEX_MESSAGE = 'Parola en az 1 büyük, 1 küçük, 1 rakam, 1 özel karakter içermelidir'
export default class BaseValidator {
  public messages: CustomMessages = {
    'enum': '{{ options.choices }} seçeneklerinden birini seçmelisiniz.',
    'minLength': '{{ field }} en az {{ options.minLength }} karakter olmalıdır.',
    'maxLength': '{{ field }} en fazla {{ options.maxLength }} karakter olmalıdır.',
    'required': '{{ field }} alanı zorunludur',
    'unique': '{{ field }} daha önce kullanılmış',
    'exists': '{{ field }} adresi sistemde kayıtlı değil',
    'alpha': '{{ field }} sadece harflerden oluşmalıdır.',
    'alphaNum': '{{ field }} sadece harfler ve rakamlar içermelidir.',
    'array': '{{ field }} dizi olmalıdır.',
    'boolean': '{{ field }} sadece doğru veya yanlış olmalıdır.',
    'confirmed': '{{ field }} tekrarı eşleşmiyor.',
    'distinct': '{{ field }} alanı yinelenen bir değere sahip.',
    'email': '{{ field }} alanına girilen e-posta adresi geçersiz.',
    'file': '{{ field }} dosya olmalıdır.',
    'ip': '{{ field }} geçerli bir IP adresi olmalıdır.',
    'notIn': 'Seçili {{ field }} geçersiz.',
    'regex': '{{ field }} biçimi geçersiz.',
    'url': '{{ field }} biçimi geçersiz.',

    'password.regex': PASSWORD_REGEX_MESSAGE,
    '_password.regex': PASSWORD_REGEX_MESSAGE,
    'username.regex': 'Kullanıcı adı sadece harf ve rakam içermelidir',
  }
}
