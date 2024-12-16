import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
} from "typeorm";
import { Article } from "./Entry";

@Entity("tag")
export class Tag {
  @PrimaryColumn({
    name: "tag_id",
  })
  tagId!: number;

  @Column({
    name: "name",
  })
  name!: string;

  @Column({
    name: "date_created",
  })
  dateCreated!: Date;

  @Column({
    name: "date_deleted",
  })
  dateDeleted!: Date;

  @ManyToMany((_type) => Article)
  @JoinTable({
    name: "tagged_entry",
    joinColumn: {
      name: "tag_id",
      referencedColumnName: "tagId",
    },
    inverseJoinColumn: {
      name: "entry_id",
      referencedColumnName: "entryId",
    },
  })
  public taggedEntries!: Promise<Article[]>;
}
