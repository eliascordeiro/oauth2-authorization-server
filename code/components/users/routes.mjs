import { getUser, login, saveUser } from "./service.mjs";

/**
 * @openapi
 * /users:
 *   post:
 *     summary: "Create user"
 * 
 *     tags:
 *       - "users"
 *     
 *     operationId: create_user
 *     x-eov-operation-handler: users/routes
 * 
 *     requestBody:
 *       description: Create user
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreateUser" 
 * 
 *     responses:
 *       '201':
 *         description: "User created"
 *       '400':
 *         description: "Invalid data provided"
 *       '401':
 *         description: "Create failed"
 */
 export async function create_user(req, res, _) {
  res.status(201).json(await saveUser(req.body));
}

/**
 * @openapi
 * /users/login:
 *   post:
 *     summary: "Logs in the user"
 * 
 *     tags:
 *       - "auth"
 *     
 *     operationId: userLogin
 *     x-eov-operation-handler: users/routes
 * 
 *     requestBody:
 *       description: Login information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UsernamePassword" 
 * 
 *     responses:
 *       '200':
 *         description: "User logged in"
 *       '400':
 *         description: "Invalid data provided"
 *       '401':
 *         description: "Login failed"
 */
export async function userLogin(req, res, _) {
  const user = await login(req.body);
  return user ? res.json(user) : res.sendStatus(401);
}

/**
 * @openapi
 * 
 * /users/me:
 *   get:
 *     summary: "Retrieves user information"
 * 
 *     tags:
 *       - "profile"
 * 
 *     operationId: get_user
 *     x-eov-operation-handler: users/routes
 * 
 *     responses:
 *       '200':
 *         description: "Returns the user"
 *       '404':
 *         description: "User not found"
 *
 *     security: 
 *       - {}
 *       - JWT: ['USER','ADMIN']
 */
export async function get_user(req, res, _) {  
  if (!req.user) return res.send("Hello guest!");

  const user = await getUser(parseInt(req.user.id));
  return user ? res.json(user) : res.sendStatus(404);  
}