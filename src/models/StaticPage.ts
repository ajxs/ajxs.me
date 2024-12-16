import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("static_page")
export class StaticPage {
  @PrimaryColumn({
    name: "page_id",
  })
  pageId!: number;

  @Column({
    name: "title",
  })
  title!: string;

  @Column({
    name: "description",
  })
  description!: string;

  @Column({
    name: "path",
  })
  path!: string;

  @Column({
    name: "body",
  })
  body!: string;

  @Column({
    name: "contains_code_blocks",
  })
  pageContainsCodeBlocks!: number;

  @Column({
    name: "date_created",
  })
  dateCreated!: Date;

  @Column({
    name: "date_modified",
  })
  dateModified!: Date;

  @Column({
    name: "date_deleted",
  })
  dateDeleted!: Date;

  get containsCodeBlocks(): boolean {
    return this.pageContainsCodeBlocks === 1;
  }
}
