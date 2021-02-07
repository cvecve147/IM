import { Get, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { AuthService } from 'src/auth/auth/auth.service';
import { Repository } from 'typeorm';
import { UserEntity } from '../models/user.entity';
import { User, UserRole } from '../models/user.interface';
import { switchMap, map } from 'rxjs/operators';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private authService: AuthService,
  ) {}

  create(user: User): Observable<User> {
    return this.authService.hashPassword(user.password).pipe(
      switchMap((passwordHash: string) => {
        const newUser = new UserEntity();
        newUser.name = user.name;
        newUser.level = user.level;
        newUser.industry = user.industry;
        newUser.position = user.position;
        newUser.power = user.power;
        newUser.password = passwordHash;
        return from(this.userRepository.save(newUser));
      }),
    );
  }
  async createAll(users: User[]) {
    return await this.userRepository
      .createQueryBuilder()
      .insert()
      .into(UserEntity)
      .values(users)
      .execute();
  }

  async findName(UserName: String) {
    return await this.userRepository.findOne({ where: { name: UserName } });
  }
  findOne(id: number): Observable<User> {
    return from(this.userRepository.findOne({ id }));
  }

  findAll(): Observable<User[]> {
    return from(this.userRepository.find());
  }
  findUser(): Observable<User[]> {
    return from(
      this.userRepository.find({
        where: { power: UserRole.USER },
      }),
    );
  }
  findAdmin(): Observable<User[]> {
    return from(
      this.userRepository.find({
        select: ['id', 'name', 'power'],
        where: [{ power: UserRole.ADMIN }, { power: UserRole.ROOT }],
      }),
    );
  }
  deleteOne(id: number): Observable<any> {
    return from(this.userRepository.delete(id));
  }
  updateRoleOfUser(id: number, user: User): Observable<any> {
    return from(this.userRepository.update(id, user));
  }

  paginate(options: IPaginationOptions): Observable<Pagination<User>> {
    return from(paginate<User>(this.userRepository, options));
  }

  updateOne(id: number, user: User): Observable<any> {
    delete user.name;
    delete user.password;
    delete user.power;

    return from(this.userRepository.update(id, user));
  }

  login(user: User): Observable<string> {
    return this.validateUser(user.name, user.password).pipe(
      switchMap((user: User) => {
        if (user) {
          return this.authService
            .generateJWT(user)
            .pipe(map((jwt: string) => jwt));
        } else {
          return 'Wrong Credentials';
        }
      }),
    );
  }

  validateUser(name: string, password: string): Observable<User> {
    return from(
      this.userRepository.findOne(
        { name },
        { select: ['id', 'password', 'power'] },
      ),
    ).pipe(
      switchMap((user: User) =>
        this.authService.comparePasswords(password, user.password).pipe(
          map((match: boolean) => {
            if (match) {
              return user;
            } else {
              throw Error;
            }
          }),
        ),
      ),
    );
  }

  findByName(name: string): Observable<User> {
    return from(this.userRepository.findOne({ name }));
  }
}
