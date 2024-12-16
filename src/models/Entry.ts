import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm';
import { Tag } from './Tag';

@Entity('entry')
export class Article {
  @PrimaryColumn({
    name: 'entry_id',
  })
  entryId!: number;

  @Column({
    name: 'title',
  })
  title!: string;

  @Column({
    name: 'description',
  })
  description!: string;

  @Column({
    name: 'body',
  })
  body!: string;

  @Column({
    name: 'contains_code_blocks',
  })
  articleContainsCodeBlocks!: number;

  @Column({
    name: 'unlisted',
  })
  unlisted!: number;

  @Column({
    name: 'date_created',
  })
  dateCreated!: Date;

  @Column({
    name: 'date_modified',
  })
  dateModified!: Date;

  @Column({
    name: 'date_deleted',
  })
  dateDeleted!: Date;

  @ManyToMany((_type) => Tag, {
    eager: true,
  })
  @JoinTable({
    name: 'tagged_entry',
    joinColumn: {
      name: 'entry_id',
      referencedColumnName: 'entryId',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'tagId',
    },
  })
  public tags!: Tag[];

  get isUnlisted(): boolean {
    return this.unlisted === 1;
  }

  get containsCodeBlocks(): boolean {
    return this.articleContainsCodeBlocks === 1;
  }
}
