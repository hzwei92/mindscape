import { 
  Entity,
  Column,
  PrimaryGeneratedColumn, 
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { findDefaultWeight } from 'src/utils';
import { Arrow } from 'src/arrows/arrow.entity';

@Entity()
export class Sheaf {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  routeName: string;

  @Index({ unique: true, where: 'url IS NOT NULL'})
  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  sourceId: string;

  @ManyToOne(() => Sheaf, { nullable: true })
  @JoinColumn({ name: 'sourceId', referencedColumnName: 'id' })
  source: Sheaf;

  @Column({ nullable: true })
  targetId: string;
  
  @ManyToOne(() => Sheaf, { nullable: true })
  @JoinColumn({ name: 'targetId', referencedColumnName: 'id' })
  target: Sheaf;


  @OneToMany(() => Sheaf, sheaf => sheaf.target)
  ins: Sheaf[];

  @OneToMany(() => Sheaf, sheaf => sheaf.source)
  outs: Sheaf[];
  
  @Column({ default: 0 })
  inCount: number;

  @Column({ default: 0 })
  outCount: number;


  @OneToMany(() => Arrow, arrow => arrow.sheaf)
  arrows: Arrow[];

  
  @Column({ default: 1 })
  clicks: number;

  @Column({ default: 0 })
  tokens: number;

  @Column({ default: findDefaultWeight(1, 0) })
  weight: number;


  @CreateDateColumn()
  createDate: Date;
  
  @UpdateDateColumn() 
  updateDate: Date;

  @DeleteDateColumn()
  deleteDate: Date;
}