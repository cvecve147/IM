import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { AuthService } from 'src/auth/auth/auth.service';
import { Repository } from 'typeorm';
import { UserEntity } from '../models/user.entity';
import { User } from '../models/user.interface';
import { switchMap, map } from 'rxjs/operators';

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
    // return from(this.userRepository.save(user));
  }

  findOne(id: number): Observable<User> {
    return from(this.userRepository.findOne({ id }));
  }

  findAll(): Observable<User[]> {
    return from(this.userRepository.find());
  }
  deleteOne(id: number): Observable<any> {
    return from(this.userRepository.delete(id));
  }

  updateOne(id: number, user: User): Observable<any> {
    delete user.name;
    delete user.password;

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
      this.userRepository.findOne({ name }, { select: ['id', 'password'] }),
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
