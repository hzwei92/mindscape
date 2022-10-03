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

  @Column({ nullable: true})
  focusId: string;

  @ManyToOne(() => Arrow, { nullable: true })
  @JoinColumn({ referencedColumnName: 'id'})
  focus: Arrow;

  @Column({
    type: 'enum',
    enum: PaletteMode,
    default: PaletteMode.DARK,
  })
  palette: PaletteMode;

  @Column('double precision', { default: 0})
  balance: number;
  
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

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;
 
  @DeleteDateColumn()
  deleteDate: Date;
}