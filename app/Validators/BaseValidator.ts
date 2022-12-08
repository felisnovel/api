import { CustomMessages } from '@ioc:Adonis/Core/Validator'

export default class BaseValidator {
  public messages: CustomMessages = {
    enum: 'The value must be one of {{ options.choices }}',
    minLength: '{{ field }} must be at least {{ options.minLength }} characters long',
    maxLength: '{{ field }} must be less then {{ options.maxLength }} characters long',
    required: '{{ field }} alanı zorunludur',
    unique: '{{ field }} daha önce kullanılmış',
    exists: '{{ field }} adresi sistemde kayıtlı değil',
  }
}
