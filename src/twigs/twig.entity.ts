import { 
  Entity,
  Tree,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  TreeParent,
  TreeChildren,
  OneToMany,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Arrow } from 'src/arrows/arrow.entity';

@Entity()
@Tree('closure-table', {
  closureTableName: 'twig',
  ancestorColumnName: () => 'ancestorId',
  descendantColumnName: () => 'descendantId'
})
export class Twig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  sourceId: string;

  @ManyToOne(() => Twig, { nullable: true })
  @JoinColumn({ referencedColumnName: 'id'})
  source: Twig;

  @Column({ nullable: true })
  targetId: string;

  @ManyToOne(() => Twig, { nullable: true })
  @JoinColumn({ referencedColumnName: 'id'})
  target: Twig;


  @OneToMany(() => Twig, twig => twig.target)
  ins: Twig[];

  @OneToMany(() => Twig, twig => twig.source)
  outs: Twig[];
  

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'id' })
  user: User;


  @Column()
  abstractId: string;

  @ManyToOne(() => Arrow)
  @JoinColumn({ referencedColumnName: 'id' })
  abstract: Arrow;

  // each twig has either a detail or a sheaf
  @Column()
  detailId: string;
  
  @ManyToOne(() => Arrow)
  @JoinColumn({ referencedColumnName: 'id' }, )
  detail: Arrow;


  @Column({ default: false })
  isRoot: boolean;
  
  @Column({ default: 0 })
  i: number;

  @Column({ default: 0 })
  x: number;

  @Column({ default: 0})
  y: number;

  @Column({ default: 0})
  z: number;

  @Column({ default: true })
  isOpen: boolean;

  @TreeParent()
  parent: Twig;

  @TreeChildren()
  children: Twig[];

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;

  @DeleteDateColumn()
  deleteDate: Date;
}