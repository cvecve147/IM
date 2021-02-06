import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { User, UserRole } from '../models/user.interface';
import { UserService } from '../service/user.service';
import { catchError, map } from 'rxjs/operators';
import { hasRoles } from 'src/auth/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/auth/guards/jwt-guards';
import { RolesGuard } from 'src/auth/auth/guards/roles.guards';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @hasRoles(UserRole.ADMIN, UserRole.ROOT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() user: User): Observable<User | Object> {
    return this.userService.create(user).pipe(
      map((user: User) => user),
      catchError((err) => of({ error: err.message })),
    );
  }

  @Post('login')
  login(@Body() user: User): Observable<Object> {
    var userEn = this.userService.login(user);
    return userEn.pipe(
      map((jwt: string) => {
        return { access_token: jwt };
      }),
    );
  }

  @hasRoles(UserRole.ADMIN, UserRole.ROOT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  findOne(@Param() params): Observable<User> {
    return this.userService.findOne(params.id);
  }

  @hasRoles(UserRole.ADMIN, UserRole.ROOT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('Root/User')
  findUser(): Observable<User[]> {
    return this.userService.findAll().pipe(
      map((users) => {
        return users.filter((user) => user.power == UserRole.USER);
      }),
    );
  }

  @hasRoles(UserRole.ADMIN, UserRole.ROOT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('Root/Admin')
  findAdmin(): Observable<User[]> {
    return this.userService.findAll().pipe(
      map((users) => {
        return users.filter((user) => user.power != UserRole.USER);
      }),
    );
  }

  @Get()
  index(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Observable<Pagination<User>> {
    limit = limit > 100 ? 100 : limit;
    return this.userService.paginate({
      page,
      limit,
      route: 'http://localhost:3000/users',
    });
  }

  @hasRoles(UserRole.ADMIN, UserRole.ROOT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll(): Observable<User[]> {
    return this.userService.findAll();
  }

  @hasRoles(UserRole.ADMIN, UserRole.ROOT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  deleteOne(@Param('id') id: string): Observable<any> {
    return this.userService.deleteOne(Number(id));
  }

  @hasRoles(UserRole.ADMIN, UserRole.ROOT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  updateOne(@Param('id') id: string, @Body() user: User): Observable<any> {
    return this.userService.updateOne(Number(id), user);
  }

  @hasRoles(UserRole.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('edit/self')
  updateSelf(
    @Request() req,
    @Param('id') id: string,
    @Body() user: User,
  ): Observable<any> {
    delete user.power;
    delete user.name;
    delete user.password;
    return this.userService.updateOne(Number(req.user.user.id), user);
  }

  @Post('upload/excel')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile('file') file) {
    return file;
  }

  @hasRoles(UserRole.USER, UserRole.ROOT, UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('get/self')
  findSelf(@Request() req): Observable<User> {
    return this.userService.findOne(req.user.user.id);
  }
}
