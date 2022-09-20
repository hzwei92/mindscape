import { 
  Entity,
  Column,
  PrimaryGeneratedColumn, 
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Vote } from 'src/votes/vote.entity';

@Entity()
export class Transfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  senderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'id' })
  sender: User;

  @Column()
  receiverId: string;

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'id' })
  receiver: User;
  
  @Column()
  credits: number;

  @Column()
  reason: string;

  @Column()
  voteId: string;
  
  @ManyToOne(() => Vote)
  @JoinColumn({ referencedColumnName: 'id' })
  vote: Vote;

  @CreateDateColumn()
  createDate: Date;
  
  @UpdateDateColumn()
  updateDate: Date;

  @DeleteDateColumn()
  deleteDate: Date;
}