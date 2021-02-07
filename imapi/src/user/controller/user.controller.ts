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
import { from, Observable, of } from 'rxjs';
import { User, UserRole } from '../models/user.interface';
import { UserService } from '../service/user.service';
import { catchError, map } from 'rxjs/operators';
import { hasRoles } from 'src/auth/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/auth/guards/jwt-guards';
import { RolesGuard } from 'src/auth/auth/guards/roles.guards';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Query } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { readFile, utils } from 'xlsx';
import { UserEntity } from '../models/user.entity';
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @hasRoles(UserRole.ROOT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() user: User): Observable<User | Object> {
    return this.userService.create(user).pipe(
      map((user: User) => user),
      catchError((err) => of({ error: err.message })),
    );
  }

  @Post('upload/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: './uploads',
    }),
  )
  async upload(@UploadedFile() file) {
    const res = readFile(file.path);
    const first_worksheet = res.Sheets[res.SheetNames[0]];
    const data = utils.sheet_to_json(first_worksheet, { header: 1 });
    const transData = [];

    await data.forEach(async (el) => {
      const user = new UserEntity();
      user.name = el[0] ? el[0] : '';
      user.password = String(el[1]) ? String(el[1]) : '';
      user.address = el[2] ? el[2] : '';
      user.phoneNumber = el[3] ? el[3] : '';
      user.level = el[4] ? el[4] : '';
      user.power = UserRole.USER;
      if (user.name != '學號') {
        console.log(user);
        transData.push(user);
      }
    });

    return await this.userService.createAll(transData);
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

  @hasRoles(UserRole.ROOT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  findOne(@Param() params): Observable<User> {
    return this.userService.findOne(params.id);
  }

  @hasRoles(UserRole.ADMIN, UserRole.ROOT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('Root/User')
  findUser(): Observable<User[]> {
    return this.userService.findUser();
  }

  @hasRoles(UserRole.ROOT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('Root/Admin')
  findAdmin(): Observable<User[]> {
    return this.userService.findAdmin();
  }

  @hasRoles(UserRole.ROOT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  deleteOne(@Param('id') id: string): Observable<any> {
    return this.userService.deleteOne(Number(id));
  }

  @hasRoles(UserRole.ROOT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  updateOne(@Param('id') id: string, @Body() user: User): Observable<any> {
    return this.userService.updateOne(Number(id), user);
  }

  @hasRoles(UserRole.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('edit/self')
  updateSelf(@Request() req, @Body() user: User): Observable<any> {
    delete user.power;
    delete user.name;
    delete user.password;
    return this.userService.updateOne(Number(req.user.user.id), user);
  }

  @hasRoles(UserRole.USER, UserRole.ROOT, UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('get/self')
  findSelf(@Request() req): Observable<User> {
    return this.userService.findOne(req.user.user.id);
  }
}
