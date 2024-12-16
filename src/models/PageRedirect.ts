import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("static_page_redirect")
export class PageRedirect {
  @PrimaryColumn({
    name: "address_from",
  })
  addressFrom!: string;

  @PrimaryColumn({
    name: "address_to",
  })
  addressTo!: string;

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
}
