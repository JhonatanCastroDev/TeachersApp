import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { name, email, password } = createUserDto;

    // Normalizar el correo.
    const normalizedEmail = email.toLowerCase().trim();

    // Verificar si el email ya está registrado.
    const existingUser = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      throw new ConflictException('El email ya está registrado.');
    }

    // Hashear la contraseña.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear y guardar el usuario.
    const user = this.userRepository.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    delete savedUser.password
    return savedUser
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const { email, password } = loginDto;

    // Normalizar el correo.
    const normalizedEmail = email.toLowerCase().trim();

    // Buscar el usuario por email normalizado.
    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
      select: {id:true, email: true, password: true}
    });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    // Comparar contraseñas.
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    // Generar token JWT.
    const payload = { id: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { token };
  }

  async getProfile(userId: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    delete user.password
    
    return user
  }
}