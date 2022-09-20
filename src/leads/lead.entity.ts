import { 
  Entity,
  Column,
  PrimaryGeneratedColumn, 
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';

@Entity()
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  leaderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'id' })
  leader: User;

  @Column()
  followerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'id' })
  follower: User;

  @CreateDateColumn()
  createDate: Date;

  @DeleteDateColumn()
  deleteDate: Date;
}