import { 
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Exclude } from 'class-transformer';
import { Arrow } from 'src/arrows/arrow.entity';
import { PaletteMode } from 'src/enums';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  @Index({ unique: true, where: '"deleteDate" is null' })
  lowercaseName: string;

  @Column()
  @Index({ unique: true, where: '"deleteDate" is null' })
  routeName: string;

  @Column({ nullable: true })
  @Index({ unique: true })
  email: string;
  
  @Column()
  color: string;

  @Column({
    type: 'enum',
    enum: PaletteMode,
    default: PaletteMode.DARK,
  })
  palette: PaletteMode;

  @Column('double precision', { default: 0})
  balance: number;

  @Column({ default: 0})
  saveN: number;

  @Column({ default: 0})
  moveN: number;

  @Column({ default: 0})
  replyN: number;

  @Column({ default: 0})
  linkN: number;

  @Column('double precision', { nullable: true })
  mapLng: number;

  @Column('double precision', { nullable: true })
  mapLat: number;

  @Column('double precision', {nullable: true})
  mapZoom: number;

  @Column({ default: false })
  isRegisteredWithGoogle: boolean;

  @Exclude()
  @Column({ nullable: true })
  hashedPassword: string;

  @Exclude()
  @Column({ nullable: true })
  hashedRefreshToken?: string;

  @Exclude()
  @Column({ nullable: true })
  hashedEmailVerificationCode: string;

  @Column({ nullable: true })
  verifyEmailDate: Date;

  @Column({default: false})
  isAdmin: boolean;

  @Column({ default: false })
  isReserve: boolean;

  @Column({default: 'NOW()'})
  activeDate: Date;

  @Column({default: 'NOW()'})
  checkAlertsDate: Date;

  @Column({nullable: true})
  loadFeedDate: Date;

  @Column({nullable: true})
  loadInsDate: Date;

  @Column({nullable: true})
  loadOutsDate: Date;

  @Column({nullable: true})
  viewInfoDate: Date;
  
  @Column({nullable: true})
  togglePaletteDate: Date;

  @Column({nullable: true})
  createGraphDate: Date;

  @Column({nullable: true})
  saveArrowDate: Date;

  @Column({nullable: true})
  firstReplyDate: Date;
  
  @Column({nullable: true})
  openPostDate: Date;

  @Column({nullable: true})
  openLinkDate: Date;

  @Column({nullable: true})
  openArrowDate: Date;
  
  @Column({nullable: true})
  moveTwigDate: Date;

  @Column({nullable: true})
  graftTwigDate: Date;

  @Column({nullable: true})
  navigateGraphDate: Date;


  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;
 
  @DeleteDateColumn()
  deleteDate: Date;
}